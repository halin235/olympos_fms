import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDemoSettlement } from '../demo/useDemoSettlement';
import SettlementSummaryCard from '../components/SettlementSummaryCard';
import GeofenceTimeline      from '../components/GeofenceTimeline';
import FuelChart             from '../components/FuelChart';
import { PendingReviewBanner } from '../components/ReceiptUploadCard';
import StaffBottomNav from '../components/StaffBottomNav';
import {
  computeFuelRawSmoothedErrorPct,
  MOCK_FUEL_READINGS,
  MOCK_FUEL_READINGS_HIGH_ERROR,
} from '../demo/mockData';
import {
  DEMO_CONTRACT_NUMBER,
  DEMO_PREVIEW_CONTRACT_END_KST,
  DEMO_PREVIEW_RETURN_CONFIRMED_KST,
  DEMO_SCHEDULED_END_AT_KST,
  DEMO_SCHEDULED_START_AT_KST,
} from '../constants/demoTimeline';

// ── 목(Mock) 계약 데이터 ─────────────────────────────────────
const MOCK_CONTRACT = {
  id:              'c3a8f2d1-0001-4e5b-9f0a-000000000001',
  contract_number: DEMO_CONTRACT_NUMBER,
  contract_type:   'insurance',
  employee_name:   '직원2',
  customer_name:   '송하린_데모버전',
  customer_phone:  '010-3472-9996',
  plate_number:    '서울1호12354',
  model_name:      '스파크',
  scheduled_start_at: DEMO_SCHEDULED_START_AT_KST,
  scheduled_end_at:   DEMO_SCHEDULED_END_AT_KST,
  handover_fuel_pct:  75,
  status: 'returned',
};

// ─────────────────────────────────────────────────────────────
// 헤더
// ─────────────────────────────────────────────────────────────
function PageHeader({ onBack }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 flex items-center px-4 py-3 gap-3 shadow-sm">
      <button onClick={onBack}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="flex-1 text-center text-base font-bold text-gray-900">배차 상세</h1>
      <span className="text-[10px] font-bold text-olympos-blue bg-olympos-blue-lt border border-blue-200 rounded-full px-2 py-0.5">
        직원용
      </span>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// 계약 기본정보 카드
// ─────────────────────────────────────────────────────────────
function ContractInfoCard({ contract }) {
  const statusMap = {
    waiting:   { label: '대기',     cls: 'bg-gray-100  text-gray-600' },
    active:    { label: '배차중',   cls: 'bg-olympos-blue text-white' },
    returned:  { label: '반납',     cls: 'bg-yellow-100 text-yellow-700' },
    settled:   { label: '정산완료', cls: 'bg-green-100  text-green-700' },
    cancelled: { label: '취소',     cls: 'bg-red-100    text-red-700' },
  };
  const { label, cls } = statusMap[contract.status] || { label: contract.status, cls: 'bg-gray-100 text-gray-600' };

  const fmtDate = (d) => new Date(d).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{contract.employee_name}</p>
          <p className="text-sm font-bold text-gray-900">연번 {contract.contract_number}</p>
        </div>
        <span className={`badge ${cls}`}>{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoItem icon="🚗" label="차량"   value={`${contract.model_name} (${contract.plate_number})`} />
        <InfoItem icon="👤" label="고객"   value={`${contract.customer_name}`} />
        <InfoItem icon="📅" label="대여"   value={fmtDate(contract.scheduled_start_at)} />
        <InfoItem icon="🏁" label="반납예정" value={fmtDate(contract.scheduled_end_at)} />
        <InfoItem icon="⛽" label="인수 연료" value={`${contract.handover_fuel_pct}%`} />
        <InfoItem icon="📋" label="계약 유형" value={contract.contract_type === 'insurance' ? '보험대차' : '일반렌트'} />
      </div>

      <button className="w-full py-2.5 rounded-lg border-2 border-olympos-blue text-olympos-blue
                         text-sm font-semibold hover:bg-olympos-blue-lt transition-colors">
        계약서 상세보기
      </button>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-base mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 정산 실행 전 데이터 검증 모달 (실시간 vs 정밀 보정 오차율)
// ─────────────────────────────────────────────────────────────
function SettlementValidationModal({
  open,
  onClose,
  avgPct,
  sampleCount,
  highError,
  onConfirmRun,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative z-[71] w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-50">
          <p className="text-[10px] font-bold text-olympos-blue uppercase tracking-wide">데이터 검증</p>
          <h3 className="text-base font-bold text-gray-900 mt-1">연료 측정 오차 확인</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            실시간 측정값과 정밀 보정값(smoothed)이 모두 존재하는 <strong>{sampleCount}개</strong> 시점 기준
            평균 상대 오차율입니다.
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-baseline justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-500 font-medium">평균 오차율</span>
            <span className={`text-2xl font-black tabular-nums ${highError ? 'text-orange-600' : 'text-olympos-blue'}`}>
              {avgPct}<span className="text-sm font-bold ml-0.5">%</span>
            </span>
          </div>

          {highError ? (
            <div className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-2.5">
              <p className="text-xs font-bold text-orange-800">데이터 오차가 큽니다. 다시 확인하시겠습니까?</p>
              <p className="text-[11px] text-orange-700 mt-1 leading-relaxed">
                센서 노이즈 또는 통신 불량 가능성이 있습니다. 검토 후 강제 실행하거나 취소할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs font-semibold text-blue-800">허용 범위 내입니다 (10% 미만)</p>
              <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">정산 엔진을 실행할 수 있습니다.</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirmRun}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50
                ${highError ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-olympos-blue hover:bg-olympos-navy shadow-blue-200'}`}
            >
              {highError ? '강제 실행' : '정산 실행'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 운영 이력 타임라인
// ─────────────────────────────────────────────────────────────
function OperationTimelineLog({ entries }) {
  if (!entries?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block flex-shrink-0" />
        <h3 className="text-sm font-bold text-gray-900">운영 이력</h3>
        <span className="ml-auto text-[10px] text-gray-400 font-medium">타임라인 로그</span>
      </div>
      <div className="px-4 pb-4">
        <div className="relative pl-6 space-y-0">
          <span className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-olympos-blue via-blue-200 to-gray-200" aria-hidden />
          <ul className="space-y-3">
            {entries.map((row, i) => (
              <li key={row.id || i} className="relative flex gap-3">
                <span className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-white border-2 border-olympos-blue flex-shrink-0 z-[1]" />
                <div className="flex-1 min-w-0 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                  <p className="text-[11px] font-mono font-bold text-olympos-blue">{row.time}</p>
                  <p className="text-xs text-gray-800 font-medium mt-0.5">{row.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 데모 정산 실행 패널
// ─────────────────────────────────────────────────────────────
function DemoCalculatePanel({ onRun, loading }) {
  const [useEstimated, setUseEstimated] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);

  const readingsForScenario = useEstimated ? MOCK_FUEL_READINGS_HIGH_ERROR : MOCK_FUEL_READINGS;
  const { avgPct, sampleCount } = useMemo(
    () => computeFuelRawSmoothedErrorPct(readingsForScenario),
    [useEstimated],
  );
  const highError = avgPct >= 10;

  const handleConfirmRun = useCallback(() => {
    setValidationOpen(false);
    onRun({ useEstimated });
  }, [onRun, useEstimated]);

  return (
    <>
      <SettlementValidationModal
        open={validationOpen}
        onClose={() => !loading && setValidationOpen(false)}
        avgPct={avgPct}
        sampleCount={sampleCount}
        highError={highError}
        onConfirmRun={handleConfirmRun}
        loading={loading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-olympos-blue to-blue-400" />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
            <h3 className="text-sm font-bold text-gray-900">정산 시뮬레이션 실행</h3>
            <span className="ml-auto text-xs font-medium text-olympos-blue bg-olympos-blue-lt px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </div>

          {/* 시나리오 카드 */}
          <div className="space-y-2">
            <ScenarioCard
              active={!useEstimated}
              onClick={() => setUseEstimated(false)}
              icon="✅"
              title="정상 반납 시나리오"
              desc="Geofence 진입 + 엔진 OFF 정상 수신 · 연체 31분 (Grace 30분 초과 1분)"
            />
            <ScenarioCard
              active={useEstimated}
              onClick={() => setUseEstimated(true)}
              icon="📡"
              title="GPS 음영 시나리오"
              desc="지하주차장 진입으로 GPS 13분 공백 → 추정 정산 · 통신 장애 배너 표시 · 연료 raw/보정 편차 증가"
              warn
            />
          </div>

          {/* 샘플 데이터 미리보기 */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-2">📊 적용될 샘플 데이터</p>
            <PreviewRow label="차량"     value="스파크 / 서울1호12354 (탱크 35L)" />
            <PreviewRow label="계약 종료" value={DEMO_PREVIEW_CONTRACT_END_KST} />
            <PreviewRow label="반납 확정" value={DEMO_PREVIEW_RETURN_CONFIRMED_KST} />
            <PreviewRow label="연료 변화" value="75% → 68.14% (−6.86%, MAF 20점)" />
            <PreviewRow
              label="검증 예상"
              value={highError ? `평균 오차 ${avgPct}% (10%↑ · 확인 필요)` : `평균 오차 ${avgPct}% (정상)`}
              bold
              accent={!highError}
            />
            <div className="border-t border-gray-200 my-1" />
            <PreviewRow label="연체료"   value="1단위 × 3,000원 = 3,000원" bold />
            <PreviewRow label="연료부족" value="2.401L × 1,720원 = 4,130원" bold />
            <PreviewRow label="합계"     value="7,130원" bold accent />
          </div>

          <button
            type="button"
            onClick={() => setValidationOpen(true)}
            disabled={loading}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all
                       bg-gradient-to-r from-olympos-blue to-olympos-navy
                       shadow-md shadow-blue-200 hover:shadow-lg active:scale-[0.98]
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                정산 엔진 실행 중…
              </span>
            ) : (
              '정산 엔진 실행 →'
            )}
          </button>
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            실행 전 연료 데이터(실시간·정밀 보정) 오차율을 검증합니다.
          </p>
        </div>
      </div>
    </>
  );
}

function ScenarioCard({ active, onClick, icon, title, desc, warn }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all
        ${active
          ? warn
            ? 'border-orange-400 bg-orange-50'
            : 'border-olympos-blue bg-olympos-blue-lt'
          : 'border-gray-200 bg-white hover:border-gray-300'}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <p className={`text-sm font-semibold ${active ? warn ? 'text-orange-700' : 'text-olympos-blue' : 'text-gray-700'}`}>
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
          ${active ? warn ? 'border-orange-400 bg-orange-400' : 'border-olympos-blue bg-olympos-blue' : 'border-gray-300'}`}>
          {active && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />}
        </div>
      </div>
    </button>
  );
}

function PreviewRow({ label, value, bold, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${accent ? 'text-olympos-blue font-bold' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 정산 확정 완료 배너
// ─────────────────────────────────────────────────────────────
function ConfirmedBanner() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-green-800">정산이 확정되었습니다</p>
        <p className="text-xs text-green-600 mt-0.5">결제 프로세스가 재개됩니다.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 고객 화면 연결 카드 (Task 3 — 직원이 고객 뷰를 직접 확인)
// ─────────────────────────────────────────────────────────────
function CustomerViewLinkCard({ navigate }) {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-violet-900">고객 정산 화면 확인</p>
        <p className="text-xs text-violet-600 mt-0.5 leading-relaxed">
          송하린_데모버전 님이 보는 화면으로 이동합니다
        </p>
      </div>
      <button
        onClick={() => navigate('detail', 'user')}
        className="flex-shrink-0 border-2 border-violet-500 text-violet-600 rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-violet-100 transition-colors whitespace-nowrap"
      >
        고객 뷰 →
      </button>
    </div>
  );
}

export default function DeploymentDetail({ navigate }) {
  const {
    settlement, geofenceEvents, fuelReadings,
    loading, error,
    fetchSettlement, runCalculation,
    confirmSettlement,
  } = useDemoSettlement();

  const [showConfirmed, setShowConfirmed] = useState(false);
  const [operationLogs, setOperationLogs] = useState([]);

  useEffect(() => { fetchSettlement(); }, [fetchSettlement]);

  useEffect(() => {
    if (!settlement) {
      setOperationLogs([]);
      return;
    }
    const engineLabel = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setOperationLogs([
      { id: 'op-1', time: '10:32', message: '정밀 보정 완료' },
      { id: 'op-2', time: '10:48', message: '반납 확정' },
      { id: 'op-3', time: engineLabel, message: '정산 엔진 실행 완료' },
    ]);
  }, [settlement?.id]);

  // 정산 확정 핸들러
  const handleConfirm = useCallback(async () => {
    if (!window.confirm('정산을 확정하시겠습니까?\n확정 후 결제 프로세스가 진행됩니다.')) return;
    await confirmSettlement('담당자');
    setShowConfirmed(true);
    const t = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setOperationLogs((prev) => [
      ...prev,
      { id: `op-${Date.now()}`, time: t, message: '정산 확정 완료 (담당자)' },
    ]);
  }, [confirmSettlement]);

  const isPendingReview = settlement?.status === 'pending_review';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-[430px] mx-auto">
      <PageHeader onBack={() => navigate?.('home')} />

      <main className="flex-1 overflow-y-auto pb-2">
        {/* 히어로 배너 */}
        <div className="relative bg-olympos-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-olympos-blue/80 to-olympos-navy" />
          <div className="relative px-5 pt-4 pb-6 text-white">
            <p className="text-xs text-blue-200 mb-0.5">편리하고 신속한 배차</p>
            <p className="text-xs text-blue-300">올림포스와 함께 안전한 하루를 보내세요 :)</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <span className="text-xs font-semibold">배차관리</span>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-3 space-y-3 pb-5">

          {/* 계약 기본정보 */}
          <ContractInfoCard contract={MOCK_CONTRACT} />

          {/* 정산 없을 때: 데모 실행 패널 */}
          {!settlement && !loading && (
            <DemoCalculatePanel onRun={runCalculation} loading={loading} />
          )}

          {/* 로딩 스피너 */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-olympos-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-500 font-medium">정산 엔진 실행 중…</p>
              <p className="text-xs text-gray-400">Geofence + OBD 데이터 분석 중</p>
            </div>
          )}

          {/* 오류 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm text-red-700 font-semibold">오류: {error}</p>
            </div>
          )}

          {/* ── 정산 리포트 섹션 ── */}
          {settlement && (
            <>
              {/* 고객 화면 연결 카드 (직원용 전용) */}
              <CustomerViewLinkCard navigate={navigate} />

              {/* 운영자 검토 중 배너 (pending_review) */}
              {isPendingReview && (
                <PendingReviewBanner uploadedAt={settlement.receipt_uploaded_at} />
              )}

              {/* 정산 요약 카드 */}
              <SettlementSummaryCard
                settlement={settlement}
                onConfirm={!isPendingReview ? handleConfirm : null}
                loading={loading}
              />

              {/* 지오펜스 타임라인 */}
              <GeofenceTimeline
                events={geofenceEvents}
                scheduledEndAt={settlement.scheduled_end_at}
                confirmedReturnAt={settlement.confirmed_return_at}
                isEstimated={settlement.is_estimated}
              />

              {/* 연료 변화 그래프 */}
              <FuelChart
                readings={fuelReadings}
                handoverFuelPct={MOCK_CONTRACT.handover_fuel_pct}
                isEstimated={settlement.is_estimated}
                gapMinutes={settlement.data_gap_minutes}
              />

              <OperationTimelineLog entries={operationLogs} />

              {/* 확정 완료 배너 */}
              {showConfirmed && <ConfirmedBanner />}
            </>
          )}
        </div>
      </main>

      <StaffBottomNav navigate={navigate} active="detail" />
    </div>
  );
}
