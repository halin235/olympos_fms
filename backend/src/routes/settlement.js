'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { confirmReturnTimeWithGapCheck, calculatePenalty } = require('../engines/penaltyEngine');
const { calculateFuelSettlement, detectDataGap }          = require('../engines/fuelEngine');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 공통: 유효성 검사 미들웨어
// ─────────────────────────────────────────────────────────────
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
}

// ─────────────────────────────────────────────────────────────
// GET /api/settlements/:contractId
// ─────────────────────────────────────────────────────────────
router.get(
  '/:contractId',
  [param('contractId').isUUID()],
  validateRequest,
  async (req, res) => {
    const { contractId } = req.params;
    try {
      const settlementRow = await pool.query(
        `SELECT s.*, c.contract_number, c.contract_type, c.employee_name, c.customer_name,
                v.plate_number, v.model_name
         FROM settlements s
         JOIN contracts c ON s.contract_id = c.id
         JOIN vehicles  v ON c.vehicle_id  = v.id
         WHERE s.contract_id = $1`,
        [contractId]
      );

      if (settlementRow.rows.length === 0) {
        return res.status(404).json({ success: false, message: '정산 데이터 없음. 먼저 정산을 실행하세요.' });
      }

      const geofenceRows = await pool.query(
        `SELECT event_type, latitude, longitude, distance_from_depot_m,
                occurred_at, is_return_confirmed, raw_payload
         FROM geofence_events
         WHERE contract_id = $1
         ORDER BY occurred_at ASC`,
        [contractId]
      );

      const fuelRows = await pool.query(
        `SELECT raw_fuel_pct, smoothed_fuel_pct, measured_at, is_return_reading, is_gap_estimated
         FROM obd_fuel_readings
         WHERE contract_id = $1
         ORDER BY measured_at ASC`,
        [contractId]
      );

      res.json({
        success: true,
        data: {
          settlement:     settlementRow.rows[0],
          geofenceEvents: geofenceRows.rows,
          fuelReadings:   fuelRows.rows,
        },
      });
    } catch (err) {
      console.error('GET /settlements/:contractId error:', err);
      res.status(500).json({ success: false, message: '서버 오류', detail: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// POST /api/settlements/calculate
//
// 요청 바디:
//   contractId          : UUID (필수)
//   geofenceEnteredAt   : ISO8601 (선택 — GPS 음영 시 null 가능)
//   engineOffAt         : ISO8601 (선택)
//   lastKnownAt         : ISO8601 (GPS 공백 시 마지막 수신 시각)
//   geofenceLat         : number  (Geofence 진입 위도, 선택)
//   geofenceLng         : number  (Geofence 진입 경도, 선택)
//   returnFuelReadings  : number[] (필수)
//   readingTimestamps   : ISO8601[] (선택 — 공백 감지용, readings와 동일 길이)
// ─────────────────────────────────────────────────────────────
router.post(
  '/calculate',
  [
    body('contractId').isUUID(),
    body('geofenceEnteredAt').optional({ nullable: true }).isISO8601().toDate(),
    body('engineOffAt').optional({ nullable: true }).isISO8601().toDate(),
    body('lastKnownAt').optional({ nullable: true }).isISO8601().toDate(),
    body('geofenceLat').optional({ nullable: true }).isFloat({ min: -90,  max: 90  }),
    body('geofenceLng').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
    body('returnFuelReadings').isArray({ min: 1 }),
    body('returnFuelReadings.*').isFloat({ min: 0, max: 100 }),
    body('readingTimestamps').optional().isArray(),
  ],
  validateRequest,
  async (req, res) => {
    const {
      contractId,
      geofenceEnteredAt   = null,
      engineOffAt         = null,
      lastKnownAt         = null,
      geofenceLat         = null,
      geofenceLng         = null,
      returnFuelReadings,
      readingTimestamps   = null,
    } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 계약 + 차량 정보 조회
      const contractRes = await client.query(
        `SELECT c.*, v.fuel_price_per_liter, v.tank_capacity_liters
         FROM contracts c
         JOIN vehicles v ON c.vehicle_id = v.id
         WHERE c.id = $1 FOR UPDATE`,
        [contractId]
      );

      if (contractRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: '계약을 찾을 수 없습니다.' });
      }

      const contract = contractRes.rows[0];

      // ── GPS 공백 사전 감지 ────────────────────────────────────
      // readingTimestamps 있으면 OBD 공백, geofenceEnteredAt 없으면 GPS 공백
      const obdGapInfo = readingTimestamps
        ? detectDataGap(readingTimestamps)
        : { hasGap: false, maxGapMinutes: 0 };

      const isGpsUnavailable = !geofenceEnteredAt;

      // ── 반납 시각 확정 (GPS 공백 예외 포함) ─────────────────
      const returnTimeResult = confirmReturnTimeWithGapCheck({
        geofenceEnteredAt,
        engineOffAt,
        lastKnownAt,
        gpsGapMinutes: isGpsUnavailable ? obdGapInfo.maxGapMinutes : 0,
      });

      const { confirmedReturnAt, isEstimated: isPenaltyEstimated, estimationBasis } = returnTimeResult;
      const isEstimated = isPenaltyEstimated || obdGapInfo.hasGap;

      // ── 페널티 계산 ─────────────────────────────────────────
      const penalty = calculatePenalty({
        scheduledEndAt:      contract.scheduled_end_at,
        confirmedReturnAt,
        penaltyRatePer30Min: parseFloat(contract.penalty_rate_per_30min),
        isEstimated,
      });

      // ── 연료 정산 계산 ─────────────────────────────────────
      const fuel = calculateFuelSettlement({
        handoverFuelPct:    parseFloat(contract.handover_fuel_pct),
        returnFuelReadings: returnFuelReadings.map(Number),
        tankCapacityLiters: parseFloat(contract.tank_capacity_liters),
        fuelPricePerLiter:  parseFloat(contract.fuel_price_per_liter),
        readingTimestamps,
      });

      const totalAmount = penalty.penaltyAmount + fuel.fuelAmount;

      // ── 추정 안내 문구 합성 ─────────────────────────────────
      let estimationNote = null;
      if (isEstimated) {
        const parts = [];
        if (isGpsUnavailable) {
          parts.push(`GPS 미수신 — ${estimationBasis === 'engine_off_only' ? '엔진 OFF 시각' : '마지막 위치 데이터'} 기준으로 반납 시각 추정`);
        }
        if (obdGapInfo.hasGap) {
          parts.push(`OBD 통신 ${obdGapInfo.maxGapMinutes}분 공백 — 마지막 수신 연료값으로 정산 금액 추정`);
        }
        estimationNote = `[통신 장애로 인한 추정치] ${parts.join(' / ')}`;
      }

      // ── 계약 상태 업데이트 ─────────────────────────────────
      await client.query(
        `UPDATE contracts
         SET actual_return_at = $1, status = 'returned', updated_at = NOW()
         WHERE id = $2`,
        [confirmedReturnAt, contractId]
      );

      // ── OBD 측정값 저장 ────────────────────────────────────
      for (let i = 0; i < returnFuelReadings.length; i++) {
        const isLast          = i === returnFuelReadings.length - 1;
        const measuredAt      = readingTimestamps?.[i]
          ? new Date(readingTimestamps[i]).toISOString()
          : null;
        const isGapEstimated  = obdGapInfo.hasGap && isLast;

        await client.query(
          `INSERT INTO obd_fuel_readings
             (contract_id, vehicle_id, raw_fuel_pct, smoothed_fuel_pct,
              measured_at, is_return_reading, is_gap_estimated)
           VALUES (
             $1, $2, $3, $4,
             COALESCE($5::TIMESTAMPTZ, NOW() - ($6 * INTERVAL '1 minute')),
             $7, $8
           )`,
          [
            contractId,
            contract.vehicle_id,
            returnFuelReadings[i],
            isLast ? fuel.smoothedReturnPct : null,
            measuredAt,
            (returnFuelReadings.length - 1 - i) * 2,
            isLast,
            isGapEstimated,
          ]
        );
      }

      // ── Geofence 이벤트 저장 ───────────────────────────────
      const lat = parseFloat(geofenceLat) || 37.5665;
      const lng = parseFloat(geofenceLng) || 126.9780;

      if (geofenceEnteredAt) {
        await client.query(
          `INSERT INTO geofence_events
             (contract_id, vehicle_id, event_type, latitude, longitude,
              distance_from_depot_m, occurred_at, is_return_confirmed)
           VALUES ($1, $2, 'enter', $3, $4, 8.5, $5, TRUE)
           ON CONFLICT DO NOTHING`,
          [contractId, contract.vehicle_id, lat, lng, geofenceEnteredAt]
        );
      }

      if (engineOffAt) {
        await client.query(
          `INSERT INTO geofence_events
             (contract_id, vehicle_id, event_type, latitude, longitude,
              distance_from_depot_m, occurred_at, is_return_confirmed)
           VALUES ($1, $2, 'engine_off', $3, $4, 8.5, $5, TRUE)
           ON CONFLICT DO NOTHING`,
          [contractId, contract.vehicle_id, lat, lng, engineOffAt]
        );
      }

      // GPS 공백으로 Geofence 이벤트 없을 경우 경고 이벤트 기록
      if (!geofenceEnteredAt && lastKnownAt) {
        await client.query(
          `INSERT INTO geofence_events
             (contract_id, vehicle_id, event_type, latitude, longitude,
              distance_from_depot_m, occurred_at, is_return_confirmed,
              raw_payload)
           VALUES ($1, $2, 'enter', $3, $4, NULL, $5, TRUE, $6)
           ON CONFLICT DO NOTHING`,
          [
            contractId, contract.vehicle_id,
            lat, lng,
            confirmedReturnAt,
            JSON.stringify({ estimated: true, basis: estimationBasis, gpsGapMinutes: obdGapInfo.maxGapMinutes }),
          ]
        );
      }

      // ── 정산 결과 Upsert ───────────────────────────────────
      const settlementRes = await client.query(
        `INSERT INTO settlements (
           contract_id,
           scheduled_end_at, confirmed_return_at,
           overdue_minutes, grace_period_minutes, billable_30min_units,
           penalty_rate, penalty_amount,
           handover_fuel_pct, return_fuel_pct, fuel_diff_pct,
           fuel_diff_liters, fuel_price_per_liter, fuel_amount,
           total_amount, status,
           is_estimated, data_gap_minutes, gap_start_at, gap_end_at,
           estimation_note, estimation_basis
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending',
           $16, $17, $18, $19, $20, $21
         )
         ON CONFLICT (contract_id) DO UPDATE SET
           scheduled_end_at     = EXCLUDED.scheduled_end_at,
           confirmed_return_at  = EXCLUDED.confirmed_return_at,
           overdue_minutes      = EXCLUDED.overdue_minutes,
           billable_30min_units = EXCLUDED.billable_30min_units,
           penalty_amount       = EXCLUDED.penalty_amount,
           return_fuel_pct      = EXCLUDED.return_fuel_pct,
           fuel_diff_pct        = EXCLUDED.fuel_diff_pct,
           fuel_diff_liters     = EXCLUDED.fuel_diff_liters,
           fuel_amount          = EXCLUDED.fuel_amount,
           total_amount         = EXCLUDED.total_amount,
           is_estimated         = EXCLUDED.is_estimated,
           data_gap_minutes     = EXCLUDED.data_gap_minutes,
           gap_start_at         = EXCLUDED.gap_start_at,
           gap_end_at           = EXCLUDED.gap_end_at,
           estimation_note      = EXCLUDED.estimation_note,
           estimation_basis     = EXCLUDED.estimation_basis,
           updated_at           = NOW()
         RETURNING *`,
        [
          contractId,
          penalty.scheduledEndAt, confirmedReturnAt,
          penalty.overdueMinutes, penalty.gracePeriodMinutes, penalty.billable30MinUnits,
          penalty.penaltyRatePer30Min, penalty.penaltyAmount,
          fuel.handoverFuelPct, fuel.smoothedReturnPct, fuel.fuelDiffPct,
          fuel.fuelDiffLiters, fuel.fuelPricePerLiter, fuel.fuelAmount,
          totalAmount,
          isEstimated, fuel.dataGapMinutes,
          fuel.gapStartAt || null, fuel.gapEndAt || null,
          estimationNote, estimationBasis,
        ]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: {
          settlement:    settlementRes.rows[0],
          penaltyDetail: penalty,
          fuelDetail:    fuel,
          isEstimated,
          estimationNote,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('POST /settlements/calculate error:', err);
      res.status(500).json({ success: false, message: '정산 처리 중 오류 발생', detail: err.message });
    } finally {
      client.release();
    }
  }
);

// ─────────────────────────────────────────────────────────────
// PATCH /api/settlements/:contractId/confirm
// ─────────────────────────────────────────────────────────────
router.patch(
  '/:contractId/confirm',
  [
    param('contractId').isUUID(),
    body('confirmedBy').notEmpty().isString(),
    body('note').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    const { contractId } = req.params;
    const { confirmedBy, note } = req.body;
    try {
      const result = await pool.query(
        `UPDATE settlements
         SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW(), note = $2, updated_at = NOW()
         WHERE contract_id = $3
         RETURNING *`,
        [confirmedBy, note || null, contractId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: '정산 데이터 없음' });
      }

      await pool.query(
        `UPDATE contracts SET status = 'settled', updated_at = NOW() WHERE id = $1`,
        [contractId]
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('PATCH /settlements/:contractId/confirm error:', err);
      res.status(500).json({ success: false, message: '서버 오류', detail: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/settlements/:contractId/fuel-readings
// ─────────────────────────────────────────────────────────────
router.get(
  '/:contractId/fuel-readings',
  [param('contractId').isUUID()],
  validateRequest,
  async (req, res) => {
    const { contractId } = req.params;
    try {
      const rows = await pool.query(
        `SELECT raw_fuel_pct, smoothed_fuel_pct, measured_at,
                is_return_reading, is_gap_estimated
         FROM obd_fuel_readings
         WHERE contract_id = $1
         ORDER BY measured_at ASC`,
        [contractId]
      );
      res.json({ success: true, data: rows.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
