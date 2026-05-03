'use strict';

/**
 * 스마트 페널티 엔진 v2
 *
 * 규칙:
 *  1. 계약 종료 시간 이후 Grace Period(기본 30분) 이내 반납 → 페널티 없음
 *  2. Grace Period 초과 시, 초과 시간을 30분 단위로 올림하여 과금
 *     예) 31분 초과 → 1단위, 61분 초과 → 2단위
 *  3. 반납 시각은 Geofence(≤10m) 진입 + Engine OFF 이벤트 중 늦은 시각으로 확정
 *  4. [NEW] GPS 공백 예외: Geofence 진입 이벤트 없을 경우 Engine OFF 또는
 *     lastKnownAt 기준으로 '예측 반납' 처리
 */

const GRACE_PERIOD_MINUTES = parseInt(process.env.GRACE_PERIOD_MINUTES || '30');
const BILLING_UNIT_MINUTES = 30;

// ─────────────────────────────────────────────────────────────
// 반납 시각 확정 (정상 케이스)
// ─────────────────────────────────────────────────────────────
/**
 * @param {Date|string} geofenceEnteredAt  - Geofence 반경(10m) 진입 타임스탬프
 * @param {Date|string} engineOffAt        - Engine OFF 타임스탬프
 * @returns {Date} confirmedReturnAt
 */
function confirmReturnTime(geofenceEnteredAt, engineOffAt) {
  if (!geofenceEnteredAt && !engineOffAt) {
    throw new Error('반납 확정에 필요한 이벤트 데이터가 없습니다.');
  }
  const times = [geofenceEnteredAt, engineOffAt].filter(Boolean);
  return new Date(Math.max(...times.map((t) => new Date(t).getTime())));
}

// ─────────────────────────────────────────────────────────────
// [NEW] 반납 시각 확정 (GPS 공백 예외 처리 포함)
// ─────────────────────────────────────────────────────────────
/**
 * 지하 주차장 등 GPS 음영 구역에서 Geofence 이벤트가 수신되지 않은 경우를 처리.
 * 우선순위: Geofence+EngineOff → EngineOff만 → lastKnownAt(최후 수신)
 *
 * @param {Object}          params
 * @param {Date|string|null} params.geofenceEnteredAt  - Geofence 진입 타임스탬프 (없으면 null)
 * @param {Date|string|null} params.engineOffAt        - Engine OFF 타임스탬프 (없으면 null)
 * @param {Date|string|null} params.lastKnownAt        - GPS/OBD 마지막 수신 타임스탬프
 * @param {number}           params.gpsGapMinutes      - GPS 미수신 경과 시간 (분)
 * @returns {{ confirmedReturnAt: Date, isEstimated: boolean, estimationBasis: string }}
 */
function confirmReturnTimeWithGapCheck({
  geofenceEnteredAt,
  engineOffAt,
  lastKnownAt    = null,
  gpsGapMinutes  = 0,
}) {
  // ① 정상 케이스: Geofence 진입 이벤트 수신
  if (geofenceEnteredAt) {
    const times = [geofenceEnteredAt, engineOffAt].filter(Boolean);
    return {
      confirmedReturnAt: new Date(Math.max(...times.map((t) => new Date(t).getTime()))),
      isEstimated:       false,
      estimationBasis:   'geofence_engine_off',
    };
  }

  // ② GPS 없음 + Engine OFF 수신: Engine OFF 시각 기준
  if (engineOffAt) {
    return {
      confirmedReturnAt: new Date(engineOffAt),
      isEstimated:       true,
      estimationBasis:   'engine_off_only',
    };
  }

  // ③ GPS·Engine OFF 모두 없음: 마지막 수신 데이터 기준 예측
  if (lastKnownAt) {
    return {
      confirmedReturnAt: new Date(lastKnownAt),
      isEstimated:       true,
      estimationBasis:   'last_known_position',
    };
  }

  throw new Error('반납 확정에 필요한 이벤트 데이터가 없습니다. (GPS 공백 포함)');
}

// ─────────────────────────────────────────────────────────────
// 페널티 금액 계산
// ─────────────────────────────────────────────────────────────
/**
 * @param {Object} params
 * @param {Date}   params.scheduledEndAt      - 계약 종료 예정 시각
 * @param {Date}   params.confirmedReturnAt   - 실제 반납 확정 시각
 * @param {number} params.penaltyRatePer30Min - 30분당 페널티 단가 (원)
 * @param {number} [params.gracePeriodMinutes] - Grace Period (기본 30분)
 * @param {boolean} [params.isEstimated]      - 예측 정산 여부
 * @returns {PenaltyResult}
 */
function calculatePenalty({
  scheduledEndAt,
  confirmedReturnAt,
  penaltyRatePer30Min,
  gracePeriodMinutes  = GRACE_PERIOD_MINUTES,
  isEstimated         = false,
}) {
  const endTime    = new Date(scheduledEndAt);
  const returnTime = new Date(confirmedReturnAt);

  const overdueMs      = returnTime.getTime() - endTime.getTime();
  const overdueMinutes = Math.max(0, Math.floor(overdueMs / 60000));

  const chargeableMinutes  = Math.max(0, overdueMinutes - gracePeriodMinutes);
  const billable30MinUnits = chargeableMinutes > 0
    ? Math.ceil(chargeableMinutes / BILLING_UNIT_MINUTES)
    : 0;

  const penaltyAmount = billable30MinUnits * penaltyRatePer30Min;

  return {
    scheduledEndAt:       endTime,
    confirmedReturnAt:    returnTime,
    overdueMinutes,
    gracePeriodMinutes,
    chargeableMinutes,
    billable30MinUnits,
    penaltyRatePer30Min,
    penaltyAmount,
    isWithinGracePeriod:  overdueMinutes <= gracePeriodMinutes,
    isEstimated,
  };
}

module.exports = { confirmReturnTime, confirmReturnTimeWithGapCheck, calculatePenalty };
