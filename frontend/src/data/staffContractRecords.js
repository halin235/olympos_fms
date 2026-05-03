/**
 * 직원 모드 — 전자계약·보험 전송 워크플로우용 목 데이터
 * 기준: 2026년 5월 (유저 화면 계약 번호·차량과 정합)
 */

import { DEMO_CONTRACT_NUMBER } from '../constants/demoTimeline';

export const STAFF_CONTRACT_RECORDS = [
  {
    id: 'ctr-1',
    deploymentId: 'c001',
    contractNo: DEMO_CONTRACT_NUMBER,
    customerName: '송하린',
    vehicleModel: '스파크',
    plateNumber: '서울1호12354',
    periodLabel: '2026.05.02 10:18 ~ 2026.05.03 10:18',
    eSignStatus: 'pending_signature',
  },
  {
    id: 'ctr-2',
    deploymentId: 'c002',
    contractNo: 'R260502630011',
    customerName: '홍길동',
    vehicleModel: 'SM6',
    plateNumber: '서울2나5678',
    periodLabel: '2026.05.01 14:00 ~ 2026.05.03 20:00',
    eSignStatus: 'signed',
  },
  {
    id: 'ctr-3',
    deploymentId: 'c003',
    contractNo: 'R260503630003',
    customerName: '박민준',
    vehicleModel: '쏘나타',
    plateNumber: '서울3가5556',
    periodLabel: '2026.05.02 08:00 ~ 2026.05.03 14:30',
    eSignStatus: 'pending_signature',
  },
  {
    id: 'ctr-4',
    deploymentId: 'c004',
    contractNo: 'R260501630004',
    customerName: '김철수',
    vehicleModel: 'K5',
    plateNumber: '경기11가0001',
    periodLabel: '2026.05.01 09:00 ~ 2026.05.02 18:00',
    eSignStatus: 'sent_insurer',
  },
  {
    id: 'ctr-5',
    deploymentId: 'c005',
    contractNo: 'R260503630005',
    customerName: '최지수',
    vehicleModel: '그랜저',
    plateNumber: '부산7다9999',
    periodLabel: '2026.05.03 11:00 ~ 2026.05.05 19:00',
    eSignStatus: 'signed',
  },
];

export const CONTRACT_FLOW_LABELS = {
  pending_signature: '서명대기',
  signed: '서명완료',
  sent_insurer: '보험사전송완료',
};

export const CONTRACT_FLOW_BADGE = {
  pending_signature: 'bg-amber-50 text-amber-800 border-amber-200',
  signed: 'bg-blue-50 text-olympos-blue border-blue-200',
  sent_insurer: 'bg-green-50 text-green-700 border-green-200',
};
