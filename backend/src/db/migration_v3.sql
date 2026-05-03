-- ============================================================
-- Migration v3: 주유 영수증 첨부 & 이의 제기(Dispute) 워크플로우
-- 실행: psql -U postgres -d olympos_fms -f backend/src/db/migration_v3.sql
-- ============================================================

-- ① settlements 테이블: 영수증 및 이의 제기 필드 추가
ALTER TABLE settlements
  ADD COLUMN IF NOT EXISTS receipt_url          TEXT,
  ADD COLUMN IF NOT EXISTS receipt_uploaded_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_disputed          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dispute_note         TEXT,
  ADD COLUMN IF NOT EXISTS review_completed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by          VARCHAR(100);

-- ② status 체크 제약 갱신: 'pending_review' 추가
ALTER TABLE settlements
  DROP CONSTRAINT IF EXISTS settlements_status_check;

ALTER TABLE settlements
  ADD CONSTRAINT settlements_status_check
  CHECK (status IN (
    'pending',          -- 정산 산출 완료, 결제 대기
    'pending_review',   -- 영수증 접수, 운영자 검토 중 (결제 HOLD)
    'confirmed',        -- 운영자 확정 (결제 진행 가능)
    'paid',             -- 결제 완료
    'disputed'          -- 분쟁 처리 중
  ));

-- ③ 인덱스
CREATE INDEX IF NOT EXISTS idx_settlements_disputed
  ON settlements(is_disputed) WHERE is_disputed = TRUE;

CREATE INDEX IF NOT EXISTS idx_settlements_pending_review
  ON settlements(status) WHERE status = 'pending_review';

COMMENT ON COLUMN settlements.receipt_url         IS '업로드된 영수증 파일 경로 (로컬: /uploads/receipts/, 운영: S3 URL)';
COMMENT ON COLUMN settlements.receipt_uploaded_at IS '고객 영수증 최초 업로드 시각';
COMMENT ON COLUMN settlements.is_disputed         IS 'TRUE = 영수증 접수로 이의 제기 활성화 (결제 자동 Hold)';
COMMENT ON COLUMN settlements.dispute_note        IS '고객이 입력한 이의 제기 사유';
