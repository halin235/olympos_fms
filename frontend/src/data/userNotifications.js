/**
 * 고객(B2C) 알림 센터 — 친절 가이드·케어 톤 (PRD 2.0)
 * 차량·고객 정보는 홈과 동일 출처: constants/demoUserRental.js
 */

import { DEMO_USER_RENTAL } from '../constants/demoUserRental';

const { customerName, vehicle, plate } = DEMO_USER_RENTAL;

export const USER_NOTIFICATION_CATEGORY = {
  return_guide: { label: '반납 안내', tone: 'text-teal-700 bg-teal-50 border-teal-100' },
  billing: { label: '정산 · 결제', tone: 'text-olympos-blue bg-blue-50 border-blue-100' },
  care: { label: '안내', tone: 'text-violet-700 bg-violet-50 border-violet-100' },
};

/** @typedef {'return_guide'|'billing'|'care'} UserNotificationCategory */

export const USER_NOTIFICATIONS = [
  {
    id: 'un-1',
    categoryKey: 'return_guide',
    title: '반납 1시간 전 안내',
    body: `${customerName} 님, 즐거운 이용 되셨나요? 송파점에서 반납하시는 ${vehicle}(${plate}) 주차 위치와 키 반납함을 확인해 주세요. 앱 지도에서도 안내됩니다.`,
    timeLabel: '오늘 13:00',
    unread: true,
  },
  {
    id: 'un-2',
    categoryKey: 'billing',
    title: '정산 완료',
    body: `이용하신 ${vehicle}(${plate})의 정산 리포트가 발행되었습니다. 내역은 「내 정산」에서 확인하실 수 있어요.`,
    timeLabel: '어제 18:42',
    unread: true,
  },
  {
    id: 'un-3',
    categoryKey: 'care',
    title: '이용해 주셔서 감사합니다',
    body:
      'OLYMPOS를 이용해 주셔서 감사합니다. 추가 문의는 채널톡 또는 고객센터로 편하게 연락 주세요.',
    timeLabel: '2026.05.02',
    unread: false,
  },
];
