/**
 * Olympos FMS — 통합 데모 타임라인 (2026년 5월 초순)
 *
 * 시나리오: 5/2 10:18 대여 → 5/3 10:18 계약 종료 시각 → 5/3 10:49:30 반납 확정
 * 화면·목 데이터에서 날짜를 바꿀 때 이 파일만 수정하면 됩니다.
 */

/** 헤더·카피 등 dot 표기 (예: OLYMPOS FMS · 2026.05.03) */
export const DEMO_DATE = '2026.05.03';

/** 계약 번호 (직원·정산 목) */
export const DEMO_CONTRACT_NUMBER = 'R260502630002';

/** 보험사 손해 접수번호 표기 데모 */
export const DEMO_CLAIM_NO = 'HA-2026-050312345';

/** 반납 처리일 — 연료·지오펜스 UTC 시계열의 날짜 부분 */
export const DEMO_RETURN_DAY_ISO = '2026-05-03';

/** 표시용 앵커 (카피 등) */
export const DEMO_DISPLAY_ANCHOR_DATE_KO = '2026년 5월 3일';

/** 계약서·카피용 월 단위 표기 */
export const DEMO_PERIOD_MONTH_KO = '2026년 5월';

/** 직원 화면 ISO (+09:00) */
export const DEMO_SCHEDULED_START_AT_KST = '2026-05-02T10:18:00+09:00';
export const DEMO_SCHEDULED_END_AT_KST = '2026-05-03T10:18:00+09:00';

/** 정산·이벤트 UTC (KST − 9시간) */
export const DEMO_SCHEDULED_END_AT_UTC = `${DEMO_RETURN_DAY_ISO}T01:18:00.000Z`;
export const DEMO_CONFIRMED_RETURN_AT_UTC = `${DEMO_RETURN_DAY_ISO}T01:49:30.000Z`;
export const DEMO_GEOFENCE_ENTER_AT_UTC = `${DEMO_RETURN_DAY_ISO}T01:48:00.000Z`;

/** 고객 홈 카드 (대여 시작은 시각 없음) */
export const DEMO_HOME_START_DATE_KO = '2026년 5월 2일';
export const DEMO_HOME_END_DATE_KO = '2026년 5월 3일 10:18';

/** 계약·정산 상세 한글 */
export const DEMO_CONTRACT_START_KO = '2026년 5월 2일 10:18';
export const DEMO_CONTRACT_END_KO = '2026년 5월 3일 10:18';
export const DEMO_RETURN_CONFIRM_KO = '2026년 5월 3일 10:49';

/** 직원 배차 상세 미리보기 한 줄 */
export const DEMO_PREVIEW_CONTRACT_END_KST = '2026-05-03 10:18 KST';
export const DEMO_PREVIEW_RETURN_CONFIRMED_KST =
  '2026-05-03 10:49:30 KST (+31.5분)';

/** 연료 OBD 시계열 measured_at 용 */
export function demoFuelMeasuredAt(timeSuffix) {
  return `${DEMO_RETURN_DAY_ISO}T${timeSuffix}`;
}
