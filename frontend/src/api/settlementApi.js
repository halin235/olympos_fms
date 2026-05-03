import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: BASE, timeout: 10000 });

// 파일 업로드용 — Content-Type을 multipart/form-data로 자동 설정
const fileApi = axios.create({ baseURL: BASE, timeout: 30000 });

export const settlementApi = {
  /** 계약의 정산 결과 조회 */
  getSettlement: (contractId) =>
    api.get(`/settlements/${contractId}`).then((r) => r.data),

  /** 정산 계산 실행 */
  calculate: (payload) =>
    api.post('/settlements/calculate', payload).then((r) => r.data),

  /** 담당자 정산 확정 */
  confirm: (contractId, body) =>
    api.patch(`/settlements/${contractId}/confirm`, body).then((r) => r.data),

  /** 연료 측정 타임시리즈 */
  getFuelReadings: (contractId) =>
    api.get(`/settlements/${contractId}/fuel-readings`).then((r) => r.data),
};

export const receiptApi = {
  /**
   * 영수증 업로드 — 즉시 status: pending_review + is_disputed: true 전환
   * @param {string} contractId
   * @param {File}   file         - 이미지(JPG/PNG/WEBP) 또는 PDF
   * @param {string} [disputeNote] - 이의 제기 사유 (선택)
   * @param {function} [onProgress] - 업로드 진행률 콜백 (0~100)
   */
  upload: (contractId, file, disputeNote = '', onProgress) => {
    const form = new FormData();
    form.append('receipt',      file);
    form.append('dispute_note', disputeNote);

    return fileApi.post(`/receipts/${contractId}/upload`, form, {
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    }).then((r) => r.data);
  },

  /** 영수증 정보 조회 */
  getReceipt: (contractId) =>
    api.get(`/receipts/${contractId}`).then((r) => r.data),

  /** [관리자] 검토 승인/기각 */
  review: (contractId, action, reviewedBy, reviewNote = '') =>
    api.patch(`/receipts/${contractId}/review`, { action, reviewedBy, reviewNote })
       .then((r) => r.data),

  /** [관리자] 검토 대기 목록 */
  getPendingList: () =>
    api.get('/receipts/admin/pending').then((r) => r.data),
};
