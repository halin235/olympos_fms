-- ============================================================
-- Migration v2: 예측 정산(Estimated Settlement) 지원
-- 실행: psql -U postgres -d olympos_fms -f backend/src/db/migration_v2.sql
-- ============================================================

-- settlements 테이블에 예측 정산 관련 컬럼 추가
ALTER TABLE settlements
  ADD COLUMN IF NOT EXISTS is_estimated       BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS data_gap_minutes   INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gap_start_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gap_end_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimation_note    TEXT,
  ADD COLUMN IF NOT EXISTS estimation_basis   VARCHAR(50);  -- 'geofence_engine_off' | 'engine_off_only' | 'last_known_position'

-- geofence_events: 위경도 실제값 저장 (기존 0,0 → 실측값)
-- (기존 컬럼 유지, 필요 시 UPDATE로 좌표 갱신)

-- obd_fuel_readings: 갭 추정 여부 플래그
ALTER TABLE obd_fuel_readings
  ADD COLUMN IF NOT EXISTS is_gap_estimated BOOLEAN NOT NULL DEFAULT FALSE;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_settlements_estimated ON settlements(is_estimated) WHERE is_estimated = TRUE;

COMMENT ON COLUMN settlements.is_estimated     IS 'GPS/OBD 데이터 공백으로 인한 예측 정산 여부';
COMMENT ON COLUMN settlements.data_gap_minutes IS 'OBD 데이터 최대 공백 시간(분)';
COMMENT ON COLUMN settlements.estimation_note  IS '추정 정산 사유 안내 문구';
COMMENT ON COLUMN settlements.estimation_basis IS '반납 시각 확정 근거 코드';
