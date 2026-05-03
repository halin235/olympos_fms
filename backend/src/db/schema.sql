-- ============================================================
-- Olympos Networks FMS - Smart Settlement Engine Schema
-- ============================================================

-- 확장 모듈
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Geofence 좌표 계산용

-- ============================================================
-- 1. 차량 (Vehicles)
-- ============================================================
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_number    VARCHAR(20)  NOT NULL UNIQUE,  -- 차량번호 (서울1가1234)
  model_name      VARCHAR(100) NOT NULL,
  fuel_type       VARCHAR(20)  NOT NULL DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline','diesel','electric','lpg')),
  fuel_price_per_liter NUMERIC(8,2) NOT NULL DEFAULT 1700.00, -- 원/L
  tank_capacity_liters NUMERIC(6,2) NOT NULL DEFAULT 50.0,    -- 탱크 용량(L)
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. 계약 (Contracts) - 보험대차 / 일반렌트
-- ============================================================
CREATE TABLE contracts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number   VARCHAR(30)  NOT NULL UNIQUE, -- 연번 예: R260502630002 (데모)
  contract_type     VARCHAR(20)  NOT NULL CHECK (contract_type IN ('insurance','general')),
  vehicle_id        UUID         NOT NULL REFERENCES vehicles(id),
  employee_name     VARCHAR(50)  NOT NULL,
  customer_name     VARCHAR(50)  NOT NULL,
  customer_phone    VARCHAR(20)  NOT NULL,
  
  -- 계약 시간
  scheduled_start_at  TIMESTAMPTZ NOT NULL,
  scheduled_end_at    TIMESTAMPTZ NOT NULL,
  actual_start_at     TIMESTAMPTZ,
  actual_return_at    TIMESTAMPTZ,  -- 실제 반납 시각 (Geofence + Engine-Off 확정)
  
  -- 인수 시점 연료 (정산 기준점)
  handover_fuel_pct   NUMERIC(5,2) CHECK (handover_fuel_pct BETWEEN 0 AND 100),
  
  -- 페널티 단가 (30분당)
  penalty_rate_per_30min NUMERIC(10,2) NOT NULL DEFAULT 3000.00,
  
  status            VARCHAR(20)  NOT NULL DEFAULT 'waiting' 
                    CHECK (status IN ('waiting','active','returned','settled','cancelled')),
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_vehicle    ON contracts(vehicle_id);
CREATE INDEX idx_contracts_status     ON contracts(status);
CREATE INDEX idx_contracts_scheduled  ON contracts(scheduled_end_at);

-- ============================================================
-- 3. Geofence 이벤트 (반납 거점 진입/엔진 OFF 로그)
-- ============================================================
CREATE TABLE geofence_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id   UUID        NOT NULL REFERENCES contracts(id),
  vehicle_id    UUID        NOT NULL REFERENCES vehicles(id),
  event_type    VARCHAR(30) NOT NULL CHECK (event_type IN ('enter','exit','engine_off','engine_on')),
  
  -- 위치 정보
  latitude      NUMERIC(10,7) NOT NULL,
  longitude     NUMERIC(10,7) NOT NULL,
  
  -- 반납 거점과의 거리 (m)
  distance_from_depot_m NUMERIC(10,2),
  
  -- 이벤트 발생 시각 (UTC)
  occurred_at   TIMESTAMPTZ NOT NULL,
  
  -- 실제 반납 확정 이벤트 여부 (Geofence ≤ 10m + engine_off 조합)
  is_return_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  
  raw_payload   JSONB,  -- 원본 IoT 데이터 보관
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_geofence_contract ON geofence_events(contract_id);
CREATE INDEX idx_geofence_vehicle  ON geofence_events(vehicle_id);
CREATE INDEX idx_geofence_occurred ON geofence_events(occurred_at DESC);

-- ============================================================
-- 4. OBD-II 연료 측정값 (Raw Sensor Data)
-- ============================================================
CREATE TABLE obd_fuel_readings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id   UUID         NOT NULL REFERENCES contracts(id),
  vehicle_id    UUID         NOT NULL REFERENCES vehicles(id),
  
  raw_fuel_pct  NUMERIC(5,2) NOT NULL CHECK (raw_fuel_pct BETWEEN 0 AND 100), -- OBD 원시값
  smoothed_fuel_pct NUMERIC(5,2),  -- Moving Average(5) 적용 후 값
  
  -- 측정 시각
  measured_at   TIMESTAMPTZ NOT NULL,
  
  -- 반납 시점 측정값 여부
  is_return_reading BOOLEAN NOT NULL DEFAULT FALSE,
  
  raw_payload   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obd_contract    ON obd_fuel_readings(contract_id);
CREATE INDEX idx_obd_measured    ON obd_fuel_readings(measured_at DESC);
CREATE INDEX idx_obd_vehicle     ON obd_fuel_readings(vehicle_id, measured_at DESC);

-- ============================================================
-- 5. 정산 결과 (Settlements)
-- ============================================================
CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id     UUID         NOT NULL UNIQUE REFERENCES contracts(id),
  
  -- ── 페널티 정산 ──────────────────────────────────────────
  scheduled_end_at       TIMESTAMPTZ NOT NULL,
  confirmed_return_at    TIMESTAMPTZ NOT NULL,  -- Geofence+EngineOff 확정 시각
  overdue_minutes        INT         NOT NULL DEFAULT 0,
  grace_period_minutes   INT         NOT NULL DEFAULT 30,  -- Grace Period
  billable_30min_units   INT         NOT NULL DEFAULT 0,   -- 과금 단위 수
  penalty_rate           NUMERIC(10,2) NOT NULL,
  penalty_amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- ── 연료 정산 ──────────────────────────────────────────
  handover_fuel_pct      NUMERIC(5,2) NOT NULL,   -- 인수 시 연료 %
  return_fuel_pct        NUMERIC(5,2) NOT NULL,   -- 반납 시 연료 % (MA 필터 적용)
  fuel_diff_pct          NUMERIC(5,2) NOT NULL,   -- 차이 (음수 = 부족)
  fuel_diff_liters       NUMERIC(8,3) NOT NULL,   -- 리터 환산
  fuel_price_per_liter   NUMERIC(8,2) NOT NULL,
  fuel_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,  -- 청구 금액 (부족분)
  
  -- ── 합계 ──────────────────────────────────────────────
  total_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- ── 상태 ──────────────────────────────────────────────
  status                 VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','confirmed','paid','disputed')),
  confirmed_by           VARCHAR(100),  -- 확정 담당자
  confirmed_at           TIMESTAMPTZ,
  note                   TEXT,
  
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_contract ON settlements(contract_id);
CREATE INDEX idx_settlements_status   ON settlements(status);

-- ============================================================
-- 6. 반납 거점 (Depots) - Geofence 기준점
-- ============================================================
CREATE TABLE depots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  latitude    NUMERIC(10,7) NOT NULL,
  longitude   NUMERIC(10,7) NOT NULL,
  radius_m    NUMERIC(8,2) NOT NULL DEFAULT 10.0,  -- Geofence 반경 (10m)
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settlements_updated_at
  BEFORE UPDATE ON settlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 시드 데이터 (개발/테스트용)
-- ============================================================
INSERT INTO depots (name, latitude, longitude, radius_m)
VALUES ('서울 본점', 37.5665, 126.9780, 10.0);

INSERT INTO vehicles (plate_number, model_name, fuel_type, fuel_price_per_liter, tank_capacity_liters)
VALUES
  ('서울1호12354', '스파크',    'gasoline', 1720.00, 35.0),
  ('서울1가1234',  '아반떼',    'gasoline', 1720.00, 50.0),
  ('서울2나5678',  'SM6',       'gasoline', 1720.00, 55.0);
