/**
 * B2C 홈·알림 등 고객 데모 프로필 단일 출처 (차종·번호판·계약 요약)
 */

import {
  DEMO_HOME_END_DATE_KO,
  DEMO_HOME_START_DATE_KO,
} from './demoTimeline';
import { DEMO_PLATE_SPARK } from './demoVehiclePlates';

export const DEMO_USER_RENTAL = {
  customerName: '송하린',
  vehicle: '스파크',
  /** UI 아이콘 분기용 — `ev`면 번개 배지 + 전기차 키워드 트리거와 동일 */
  powertrain: 'ice',
  plate: DEMO_PLATE_SPARK,
  startDate: DEMO_HOME_START_DATE_KO,
  endDate: DEMO_HOME_END_DATE_KO,
  status: 'returned',
  contractType: '보험대차',
  days: 1,
};
