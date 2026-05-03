'use strict';

/**
 * 연료 정산 엔진 v2
 *
 * 핵심 로직:
 *  1. Moving Average Filter(MAF) - 최근 N개(기본 5개) OBD-II 측정값 평균으로 노이즈 제거
 *  2. 반납 시 연료 % = MAF 적용 스무딩 값
 *  3. (인수 시 연료% - 반납 시 연료%) * 탱크 용량(L) = 소모 리터
 *  4. 소모 리터 * 리터당 단가 = 정산 금액 (부족분만 청구)
 *  5. [NEW] 데이터 공백 감지: 10분 이상 수신 단절 시 → 예측 정산(isEstimated) 플래그 설정
 */

const MA_WINDOW              = parseInt(process.env.FUEL_MA_WINDOW              || '5');
const GAP_THRESHOLD_MINUTES  = parseInt(process.env.DATA_GAP_THRESHOLD_MINUTES  || '10');

// ─────────────────────────────────────────────────────────────
// Moving Average Filter
// ─────────────────────────────────────────────────────────────
/**
 * 주어진 측정값 배열의 끝 N개 평균을 반환
 * @param {number[]} readings  - 시간순 정렬된 연료% 배열
 * @param {number}   window    - 평균 윈도우 크기
 * @returns {number}
 */
function movingAverageFilter(readings, window = MA_WINDOW) {
  if (!readings || readings.length === 0) {
    throw new Error('연료 측정 데이터가 없습니다.');
  }
  const slice = readings.slice(-window);
  const sum   = slice.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / slice.length).toFixed(2));
}

// ─────────────────────────────────────────────────────────────
// [NEW] 데이터 수신 공백 감지
// ─────────────────────────────────────────────────────────────
/**
 * OBD/GPS 타임스탬프 배열을 분석해 10분 이상 공백이 있는지 감지.
 * 지하 주차장 등 통신 음영 구역 진입 시나리오에 대응.
 *
 * @param {(Date|string)[]} timestamps     - 측정 타임스탬프 배열 (시간 오름차순)
 * @param {number}          thresholdMinutes - 공백 판단 임계값 (기본 10분)
 * @returns {DataGapResult}
 */
function detectDataGap(timestamps, thresholdMinutes = GAP_THRESHOLD_MINUTES) {
  if (!timestamps || timestamps.length < 2) {
    return { hasGap: false, maxGapMinutes: 0, gapStartAt: null, gapEndAt: null };
  }

  let maxGapMs  = 0;
  let gapStartAt = null;
  let gapEndAt   = null;

  for (let i = 1; i < timestamps.length; i++) {
    const gapMs = new Date(timestamps[i]).getTime() - new Date(timestamps[i - 1]).getTime();
    if (gapMs > maxGapMs) {
      maxGapMs   = gapMs;
      gapStartAt = new Date(timestamps[i - 1]);
      gapEndAt   = new Date(timestamps[i]);
    }
  }

  const maxGapMinutes = Math.floor(maxGapMs / 60000);

  return {
    hasGap: maxGapMinutes >= thresholdMinutes,
    maxGapMinutes,
    gapStartAt,
    gapEndAt,
  };
}

// ─────────────────────────────────────────────────────────────
// 연료 정산 계산
// ─────────────────────────────────────────────────────────────
/**
 * @param {Object}          params
 * @param {number}          params.handoverFuelPct       - 인수 시 연료 % (계약 시작 시점)
 * @param {number[]}        params.returnFuelReadings    - 반납 시점 근처 OBD-II 원시 측정값 배열 (시간순)
 * @param {number}          params.tankCapacityLiters    - 탱크 용량(L)
 * @param {number}          params.fuelPricePerLiter     - 리터당 단가(원)
 * @param {number}          [params.maWindow]            - MAF 윈도우 크기 (기본 5)
 * @param {(Date|string)[]} [params.readingTimestamps]   - 측정 타임스탬프 배열 (공백 감지용, 선택)
 * @returns {FuelResult}
 */
function calculateFuelSettlement({
  handoverFuelPct,
  returnFuelReadings,
  tankCapacityLiters,
  fuelPricePerLiter,
  maWindow            = MA_WINDOW,
  readingTimestamps   = null,
}) {
  // ── 데이터 공백 감지 ────────────────────────────────────────
  const gapInfo = readingTimestamps
    ? detectDataGap(readingTimestamps)
    : { hasGap: false, maxGapMinutes: 0, gapStartAt: null, gapEndAt: null };

  // ── MAF 스무딩 ──────────────────────────────────────────────
  const smoothedReturnPct = movingAverageFilter(returnFuelReadings, maWindow);

  const fuelDiffPct    = handoverFuelPct - smoothedReturnPct;
  const fuelDiffLiters = parseFloat(((fuelDiffPct / 100) * tankCapacityLiters).toFixed(3));

  const chargeableLiters = Math.max(0, fuelDiffLiters);
  const fuelAmount       = parseFloat((chargeableLiters * fuelPricePerLiter).toFixed(0));

  // ── 추정 정산 안내 문구 ────────────────────────────────────
  const estimationNote = gapInfo.hasGap
    ? `통신 장애(${gapInfo.maxGapMinutes}분 공백)로 인한 추정치 — 마지막 수신 데이터 기준으로 산출되었습니다.`
    : null;

  return {
    handoverFuelPct,
    rawReturnReadings:  returnFuelReadings,
    smoothedReturnPct,
    maWindowUsed:       Math.min(maWindow, returnFuelReadings.length),
    fuelDiffPct:        parseFloat(fuelDiffPct.toFixed(2)),
    fuelDiffLiters,
    chargeableLiters,
    tankCapacityLiters,
    fuelPricePerLiter,
    fuelAmount,
    hasFuelDeficit:     fuelDiffPct > 0,
    // 데이터 공백 관련
    isEstimated:        gapInfo.hasGap,
    dataGapMinutes:     gapInfo.maxGapMinutes,
    gapStartAt:         gapInfo.gapStartAt,
    gapEndAt:           gapInfo.gapEndAt,
    estimationNote,
  };
}

module.exports = { movingAverageFilter, detectDataGap, calculateFuelSettlement };
