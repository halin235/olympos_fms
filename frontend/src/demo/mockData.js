/**
 * 올림포스 FMS 데모용 샘플 데이터
 *
 * 시나리오:
 *   차량: 스파크 (123하 4567), 탱크 35L
 *   계약 종료: 2026-05-03 10:18 KST
 *   지오펜스 진입: 10:48 KST (+30분)
 *   엔진 OFF: 10:49:30 KST (+31.5분)
 *   연료: 인수 75% → 반납(MAF) 68.14% (6.86% 감소)
 *
 * 정산 결과:
 *   연체료   = ceil((31-30)/30) × 3,000 =  3,000원 (1단위)
 *   연료부족 = 6.86%/100 × 35L × 1,720원 = 4,130원
 *   합계     = 7,130원
 */

import {
  DEMO_CONTRACT_NUMBER,
  DEMO_SCHEDULED_END_AT_UTC,
  DEMO_CONFIRMED_RETURN_AT_UTC,
  DEMO_GEOFENCE_ENTER_AT_UTC,
  demoFuelMeasuredAt,
} from '../constants/demoTimeline';
import { DEMO_PLATE_SPARK } from '../constants/demoVehiclePlates';

// ── 연료 측정값 (OBD-II, 2분 간격, KST 10:10~10:48) ──────────
// raw   : OBD 원시값 (노이즈 포함)
// smoothed: Moving Average Filter (최근 5점 평균)
// null  : 윈도우 미충족 구간

export const MOCK_FUEL_READINGS = [
  // index  time(KST) raw    smoothed
  { raw_fuel_pct: 75.2, smoothed_fuel_pct: null,  measured_at: demoFuelMeasuredAt('01:10:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 74.8, smoothed_fuel_pct: null,  measured_at: demoFuelMeasuredAt('01:12:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 74.3, smoothed_fuel_pct: null,  measured_at: demoFuelMeasuredAt('01:14:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 73.8, smoothed_fuel_pct: null,  measured_at: demoFuelMeasuredAt('01:16:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 73.5, smoothed_fuel_pct: 74.32, measured_at: demoFuelMeasuredAt('01:18:00.000Z'), is_return_reading: false, is_gap_estimated: false }, // MAF 시작
  { raw_fuel_pct: 73.1, smoothed_fuel_pct: 73.90, measured_at: demoFuelMeasuredAt('01:20:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 72.9, smoothed_fuel_pct: 73.52, measured_at: demoFuelMeasuredAt('01:22:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 72.4, smoothed_fuel_pct: 73.14, measured_at: demoFuelMeasuredAt('01:24:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 71.8, smoothed_fuel_pct: 72.74, measured_at: demoFuelMeasuredAt('01:26:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 71.5, smoothed_fuel_pct: 72.34, measured_at: demoFuelMeasuredAt('01:28:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 70.9, smoothed_fuel_pct: 71.90, measured_at: demoFuelMeasuredAt('01:30:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 70.5, smoothed_fuel_pct: 71.42, measured_at: demoFuelMeasuredAt('01:32:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 70.1, smoothed_fuel_pct: 70.96, measured_at: demoFuelMeasuredAt('01:34:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 69.8, smoothed_fuel_pct: 70.56, measured_at: demoFuelMeasuredAt('01:36:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 69.4, smoothed_fuel_pct: 70.14, measured_at: demoFuelMeasuredAt('01:38:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 69.1, smoothed_fuel_pct: 69.78, measured_at: demoFuelMeasuredAt('01:40:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 68.8, smoothed_fuel_pct: 69.44, measured_at: demoFuelMeasuredAt('01:42:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 68.4, smoothed_fuel_pct: 69.12, measured_at: demoFuelMeasuredAt('01:44:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  { raw_fuel_pct: 67.9, smoothed_fuel_pct: 68.74, measured_at: demoFuelMeasuredAt('01:46:00.000Z'), is_return_reading: false, is_gap_estimated: false },
  // 반납 확정 시점 (엔진 OFF, 10:48 KST → 초록 점)
  { raw_fuel_pct: 68.5, smoothed_fuel_pct: 68.14, measured_at: demoFuelMeasuredAt('01:48:00.000Z'), is_return_reading: true,  is_gap_estimated: false },
];

/**
 * 통신 불량 시나리오용: 실시간 측정값(raw)과 정밀 보정값(smoothed) 간 편차가 커지도록 노이즈 적용
 * (직원용 데이터 검증 데모 — 평균 오차율 10% 이상 유도)
 */
export const MOCK_FUEL_READINGS_HIGH_ERROR = MOCK_FUEL_READINGS.map((row) => {
  if (row.smoothed_fuel_pct == null) return { ...row };
  const factor = row.is_return_reading ? 1.15 : 1.13;
  const raw = Math.min(100, Math.round(row.smoothed_fuel_pct * factor * 100) / 100);
  return { ...row, raw_fuel_pct: raw };
});

/**
 * 실시간 측정값 vs 정밀 보정값 평균 상대 오차율 (%)
 * 각 시점: |raw − smoothed| / max(smoothed, ε) × 100 의 평균
 */
export function computeFuelRawSmoothedErrorPct(readings) {
  const pairs = readings.filter(
    (r) => r.smoothed_fuel_pct != null && typeof r.raw_fuel_pct === 'number',
  );
  if (!pairs.length) return { avgPct: 0, sampleCount: 0 };
  const sum = pairs.reduce((acc, r) => {
    const sm = Math.max(Number(r.smoothed_fuel_pct), 0.01);
    return acc + Math.abs(r.raw_fuel_pct - r.smoothed_fuel_pct) / sm * 100;
  }, 0);
  const avgPct = sum / pairs.length;
  return { avgPct: Math.round(avgPct * 100) / 100, sampleCount: pairs.length };
}

// ── 지오펜스 이벤트 타임라인 ──────────────────────────────────
export const MOCK_GEOFENCE_EVENTS = [
  {
    event_type:            'enter',
    latitude:              37.566534,
    longitude:             126.978053,
    distance_from_depot_m: 8.5,
    occurred_at:           DEMO_GEOFENCE_ENTER_AT_UTC,   // KST 10:48
    is_return_confirmed:   true,
    raw_payload:           null,
  },
  {
    event_type:            'engine_off',
    latitude:              37.566534,
    longitude:             126.978053,
    distance_from_depot_m: 8.5,
    occurred_at:           DEMO_CONFIRMED_RETURN_AT_UTC, // KST 10:49:30
    is_return_confirmed:   true,
    raw_payload:           null,
  },
];

// ── 정산 결과 (pending 상태 초기값) ──────────────────────────
export const MOCK_SETTLEMENT_BASE = {
  id:                   'demo-settlement-001',
  contract_id:          'c3a8f2d1-0001-4e5b-9f0a-000000000001',
  contract_number:      DEMO_CONTRACT_NUMBER,
  contract_type:        'insurance',
  employee_name:        '직원2',
  customer_name:        '직원2 고객',
  plate_number:         DEMO_PLATE_SPARK,
  model_name:           '스파크',

  scheduled_end_at:     DEMO_SCHEDULED_END_AT_UTC,   // KST 10:18
  confirmed_return_at:  DEMO_CONFIRMED_RETURN_AT_UTC, // KST 10:49:30

  overdue_minutes:       31,
  grace_period_minutes:  30,
  billable_30min_units:  1,          // ceil((31-30)/30) = 1단위
  penalty_rate:          3000,
  penalty_amount:        3000,       // 1 × 3,000원

  handover_fuel_pct:     75,
  return_fuel_pct:       68.14,
  fuel_diff_pct:         6.86,
  fuel_diff_liters:      2.401,      // 6.86% / 100 × 35L
  fuel_price_per_liter:  1720,
  fuel_amount:           4130,       // 2.401 × 1,720 ≈ 4,130원

  total_amount:          7130,       // 3,000 + 4,130

  status:                'pending',
  is_estimated:          false,
  data_gap_minutes:      0,
  estimation_note:       null,
  estimation_basis:      'geofence_engine_off',

  is_disputed:           false,
  receipt_url:           null,
  receipt_uploaded_at:   null,
  reviewed_by:           null,
  review_completed_at:   null,
  confirmed_by:          null,
  confirmed_at:          null,
  note:                  null,
  created_at:            DEMO_CONFIRMED_RETURN_AT_UTC,
  updated_at:            DEMO_CONFIRMED_RETURN_AT_UTC,
};

// ── GPS 음영 시나리오용 추정 정산 ────────────────────────────
export const MOCK_SETTLEMENT_ESTIMATED = {
  ...MOCK_SETTLEMENT_BASE,
  is_estimated:     true,
  data_gap_minutes: 13,
  estimation_note:  '[통신 장애로 인한 추정치] GPS 미수신 — 엔진 OFF 시각 기준으로 반납 시각 추정 / OBD 통신 13분 공백 — 마지막 수신 연료값으로 정산 금액 추정',
  estimation_basis: 'engine_off_only',
};
