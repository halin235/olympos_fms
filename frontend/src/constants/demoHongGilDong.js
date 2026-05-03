/**
 * 홍길동 고객 — 차량·번호판·계약 메타 (Single Source of Truth)
 * 전기차(Tesla Model 3) · 렌터카 번호판 [숫자][허][공백][4자리]
 */

export const HONG_GILDONG_DEPLOYMENT_ID = 'c002';

export const HONG_GILDONG_RENTAL = {
  deploymentId: HONG_GILDONG_DEPLOYMENT_ID,
  customerName: '홍길동',
  customerPhoneMasked: '010-****-5678',
  /** UI 표기 — 카피·리스트 공통 */
  vehicleModel: '테슬라 모델 3',
  /** 리스트·상단 차종 한 줄 (내연기관은 미사용 시 vehicleModel만 표시) */
  vehicleListTitle: '테슬라 모델 3 (Tesla Model 3) 화이트',
  plateNumber: '123허 7890',
  powertrain: 'ev',
  contractNo: 'R260502630011',
  startAt: '26.05.02 14:00',
  endAt: '26.05.03 20:00',
  /** 상세·타임라인용 (KST 오프셋 고정) */
  scheduled_start_at_iso: '2026-05-02T14:00:00+09:00',
  scheduled_end_at_iso: '2026-05-03T20:00:00+09:00',
  /** 반납 지점 — 운행중: 예정 지점 / 반납완료: 완료 문구 배지 */
  dropoffBranchLabel: '송파점',
  returnCompletedBranchLabel: '송파점 반납 완료',
  /** 배터리 SOC(%) 데모 — 기존 fuelPct 필드와 호환 */
  energyPct: 82,
};

/** 계약·요약 카드용 한 줄 기간 */
export function getHongGilDongPeriodLabelKo() {
  return '2026.05.02 14:00 ~ 2026.05.03 20:00';
}
