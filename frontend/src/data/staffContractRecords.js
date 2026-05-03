/**
 * 직원 모드 — 전자계약·보험 전송 워크플로우용 목 데이터
 * 기준: 2026년 5월 (유저 화면 계약 번호·차량과 정합)
 */

import { DEMO_CONTRACT_NUMBER } from '../constants/demoTimeline';
import {
  HONG_GILDONG_RENTAL,
  getHongGilDongPeriodLabelKo,
} from '../constants/demoHongGilDong';
import {
  DEMO_PLATE_GRANDEUR,
  DEMO_PLATE_K5,
  DEMO_PLATE_SONATA,
  DEMO_PLATE_SPARK,
} from '../constants/demoVehiclePlates';

export const STAFF_CONTRACT_RECORDS = [
  {
    id: 'ctr-1',
    deploymentId: 'c001',
    contractNo: DEMO_CONTRACT_NUMBER,
    customerName: '송하린',
    vehicleModel: '스파크',
    plateNumber: DEMO_PLATE_SPARK,
    periodLabel: '2026.05.02 10:18 ~ 2026.05.03 10:18',
    eSignStatus: 'pending_signature',
  },
  {
    id: 'ctr-2',
    deploymentId: HONG_GILDONG_RENTAL.deploymentId,
    contractNo: HONG_GILDONG_RENTAL.contractNo,
    customerName: HONG_GILDONG_RENTAL.customerName,
    vehicleModel: HONG_GILDONG_RENTAL.vehicleModel,
    vehicleListTitle: HONG_GILDONG_RENTAL.vehicleListTitle,
    plateNumber: HONG_GILDONG_RENTAL.plateNumber,
    powertrain: HONG_GILDONG_RENTAL.powertrain,
    dropoffBranchLabel: HONG_GILDONG_RENTAL.dropoffBranchLabel,
    returnCompletedBranchLabel: HONG_GILDONG_RENTAL.returnCompletedBranchLabel,
    periodLabel: getHongGilDongPeriodLabelKo(),
    eSignStatus: 'signed',
  },
  {
    id: 'ctr-3',
    deploymentId: 'c003',
    contractNo: 'R260503630003',
    customerName: '박민준',
    vehicleModel: '쏘나타',
    plateNumber: DEMO_PLATE_SONATA,
    periodLabel: '2026.05.02 08:00 ~ 2026.05.03 14:30',
    eSignStatus: 'pending_signature',
  },
  {
    id: 'ctr-4',
    deploymentId: 'c004',
    contractNo: 'R260501630004',
    customerName: '김철수',
    vehicleModel: 'K5',
    plateNumber: DEMO_PLATE_K5,
    periodLabel: '2026.05.01 09:00 ~ 2026.05.02 18:00',
    eSignStatus: 'sent_insurer',
  },
  {
    id: 'ctr-5',
    deploymentId: 'c005',
    contractNo: 'R260503630005',
    customerName: '최지수',
    vehicleModel: '그랜저',
    plateNumber: DEMO_PLATE_GRANDEUR,
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
