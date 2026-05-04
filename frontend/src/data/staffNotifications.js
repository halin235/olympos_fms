/**
 * 직원(B2B) 알림 센터 — 업무 액션·긴급도 중심 (PRD 2.0)
 *
 * urgency → 좌측 우선순위 바 색상
 * - critical: 빨강 (즉시 조치)
 * - warning: 노랑 (검토·후속)
 * - info: 파랑 (참고·완료 알림)
 */

export const STAFF_NOTIFICATION_URGENCY = {
  critical: { label: '긴급', barClass: 'bg-red-500', rowTint: 'bg-red-50/40' },
  warning: { label: '검토', barClass: 'bg-amber-400', rowTint: 'bg-amber-50/35' },
  info: { label: '일반', barClass: 'bg-olympos-blue', rowTint: 'bg-blue-50/30' },
};

export const STAFF_NOTIFICATIONS = [
  {
    id: 'sn-1',
    urgency: 'critical',
    title: '긴급: [123허 7890] 홍길동 고객 — 반납 예정 시각 30분 경과 (미반납)',
    detail: '현장 연락 및 차량 위치 확인 필요.',
    timeLabel: '14:08',
    plate: '123허 7890',
  },
  {
    id: 'sn-2',
    urgency: 'warning',
    title: '검토 요청: 송하린 직원 — 스파크 연료 정산 이의 제기 접수',
    detail: '번호 123하 4567 · 고객 영수증 첨부. 운영자 검토 대기.',
    timeLabel: '11:52',
    plate: '123하 4567',
  },
  {
    id: 'sn-3',
    urgency: 'warning',
    title: '전자계약 서명 대기 알림',
    detail: '박민준 고객 · 쏘나타(24호 1357) 계약 전자서명 미완료. 리마인드 발송 권장.',
    timeLabel: '09:20',
    plate: '24호 1357',
  },
  {
    id: 'sn-4',
    urgency: 'info',
    title: '반납 확정 · 서초점',
    detail: '그랜저(198하 2468) 최지수 고객 반납 처리 완료. 차량 상태 사진 4건 업로드됨.',
    timeLabel: '어제 19:05',
    plate: '198하 2468',
  },
];
