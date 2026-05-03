/**
 * useDemoSettlement — 백엔드 없이 모든 상태 전환을 시뮬레이션하는 Mock 훅
 *
 * 구현된 시나리오:
 *   1. 초기 → 정산 없음 (CalculatePanel 표시)
 *   2. "정산 엔진 실행" → 1.2초 로딩 → 정산 리포트 표시 (status: pending)
 *   3. "주유 영수증 첨부하기" → 파일 업로드 → pending_review + PendingReviewBanner
 *   4. "정산 확정하기" → confirmed (관리자 승인 시뮬레이션)
 *   5. GPS 음영 토글 → is_estimated: true + EstimatedWarningBanner
 */

import { useState, useCallback, useRef } from 'react';
import {
  MOCK_FUEL_READINGS,
  MOCK_FUEL_READINGS_HIGH_ERROR,
  MOCK_GEOFENCE_EVENTS,
  MOCK_SETTLEMENT_BASE,
  MOCK_SETTLEMENT_ESTIMATED,
} from './mockData';

// 비동기 딜레이 헬퍼
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useDemoSettlement() {
  const [settlement,     setSettlement]     = useState(null);
  const [geofenceEvents, setGeofenceEvents] = useState([]);
  const [fuelReadings,   setFuelReadings]   = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  // 초기 조회 (실제 앱은 API 호출, 데모는 null 반환으로 CalculatePanel 표시)
  const fetchSettlement = useCallback(async () => {
    // 데모: 이미 settlement가 있으면 그대로 유지 (리프레시 시)
    // 최초 로드에서는 null을 유지해 CalculatePanel 표시
  }, []);

  // ── 정산 계산 실행 ──────────────────────────────────────────
  const runCalculation = useCallback(async ({ useEstimated = false } = {}) => {
    setLoading(true);
    setError(null);

    try {
      await delay(1200);  // 실제 API 응답 시간 시뮬레이션

      const base = useEstimated ? MOCK_SETTLEMENT_ESTIMATED : MOCK_SETTLEMENT_BASE;

      setSettlement({ ...base, status: 'pending' });
      setGeofenceEvents(MOCK_GEOFENCE_EVENTS);
      setFuelReadings(useEstimated ? MOCK_FUEL_READINGS_HIGH_ERROR : MOCK_FUEL_READINGS);
    } catch (e) {
      setError('정산 계산 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 담당자 정산 확정 ────────────────────────────────────────
  const confirmSettlement = useCallback(async (confirmedBy) => {
    setLoading(true);
    try {
      await delay(800);
      setSettlement((prev) => ({
        ...prev,
        status:       'confirmed',
        confirmed_by: confirmedBy || '담당자',
        confirmed_at: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 영수증 업로드 (Mock: 진행률 시뮬레이션) ────────────────
  const uploadReceipt = useCallback(async (file, disputeNote = '', onProgress) => {
    // 진행률 0 → 100 (50ms 간격으로 5% 씩 증가 = 약 1초)
    for (let p = 0; p <= 100; p += 5) {
      await delay(50);
      onProgress?.(p);
    }

    const now = new Date().toISOString();
    setSettlement((prev) => ({
      ...prev,
      status:               'pending_review',
      is_disputed:          true,
      dispute_note:         disputeNote,
      receipt_url:          `/uploads/receipts/demo-${Date.now()}-${file.name}`,
      receipt_uploaded_at:  now,
    }));

    return {
      success: true,
      message: '영수증이 접수되었습니다. 운영자 확인 후 최종 정산됩니다.',
      data: {
        settlement: {
          status:              'pending_review',
          is_disputed:         true,
          receipt_uploaded_at: now,
        },
        isOnHold:    true,
        statusLabel: '검토 중 (결제 보류)',
      },
    };
  }, []);

  return {
    settlement,
    geofenceEvents,
    fuelReadings,
    loading,
    error,
    fetchSettlement,
    runCalculation,
    confirmSettlement,
    uploadReceipt,   // receiptApi.upload 대신 이걸 ReceiptUploadCard에 주입
  };
}
