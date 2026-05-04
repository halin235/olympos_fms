/**
 * UserSettlementPage — B2C 고객용 정산 상세 페이지
 *
 * Task 1: '주유 부족 요금' 항목 클릭 → 연료 그래프 섹션으로 Smooth Scroll
 * Task 2: 영수증 첨부 카드 하단에 '정산 내역에 동의하며 바로 확정하기' 버튼 추가
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDemoSettlement } from '../demo/useDemoSettlement';
import FuelChart from '../components/FuelChart';
import { DEMO_CONTRACT_END_KO, DEMO_RETURN_CONFIRM_KO } from '../constants/demoTimeline';
import { DEMO_PLATE_SPARK } from '../constants/demoVehiclePlates';

const MOCK_CONTRACT = {
  customerName:  '송하린_데모버전',
  vehicle:       '스파크',
  plate:         DEMO_PLATE_SPARK,
  endDate:       DEMO_CONTRACT_END_KO,
  returnDate:    DEMO_RETURN_CONFIRM_KO,
  handoverFuel:  75,
  status:        'returned',
};

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export default function UserSettlementPage({ navigate }) {
  const {
    settlement, fuelReadings, loading,
    runCalculation, confirmSettlement, uploadReceipt,
  } = useDemoSettlement();

  const [showDone, setShowDone] = useState(false);

  // Task 1: 연료 그래프 섹션 ref — smooth scroll 타깃
  const fuelSectionRef = useRef(null);

  const scrollToFuel = useCallback(() => {
    fuelSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // 페이지 진입 시 정상 시나리오 자동 실행
  useEffect(() => {
    runCalculation({ useEstimated: false });
  }, [runCalculation]);

  const handleConfirm = useCallback(async () => {
    if (!window.confirm('정산 금액에 동의하고 확정하시겠습니까?')) return;
    await confirmSettlement('본인');
    setShowDone(true);
  }, [confirmSettlement]);

  const isPending       = settlement?.status === 'pending';
  const isPendingReview = settlement?.status === 'pending_review';
  const isConfirmed     = settlement?.status === 'confirmed' || showDone;

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 shrink-0 bg-white border-b border-gray-100 flex items-center px-4 py-3 gap-3 shadow-sm">
        <button onClick={() => navigate('home')}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900">내 정산 내역</h1>
        <div className="w-8" />
      </header>

      <main className="flex flex-col pb-1">
        {/* 히어로 배너 */}
        <div className="bg-olympos-navy relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-olympos-blue/60 to-olympos-navy" />
          <div className="relative px-5 pt-5 pb-8 text-white">
            <p className="text-xs text-blue-200">{MOCK_CONTRACT.customerName} 님의</p>
            <p className="text-sm font-bold mt-0.5">반납 후 정산 내역</p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
              <span className="text-xs font-semibold">반납 완료</span>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-3 pb-6">
          {/* 내 이용 정보 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-olympos-blue-lt flex items-center justify-center">
                <svg className="w-5 h-5 text-olympos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-gray-900">{MOCK_CONTRACT.vehicle}</p>
                <p className="mt-0.5 text-xs font-semibold text-gray-700 font-mono tabular-nums whitespace-nowrap">
                  {MOCK_CONTRACT.plate}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-400">반납 예정</p>
                <p className="text-xs font-semibold text-gray-700">{MOCK_CONTRACT.endDate}</p>
              </div>
            </div>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-olympos-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-500 font-medium">정산 내역을 불러오는 중…</p>
            </div>
          )}

          {settlement && (
            <>
              {/* 운영자 검토 배너 */}
              {isPendingReview && <UserPendingBanner uploadedAt={settlement.receipt_uploaded_at} />}

              {/* ★ 내가 낼 금액 — Task 1: onFuelClick 전달 */}
              <UserAmountCard
                settlement={settlement}
                onConfirm={!isPendingReview && !isConfirmed ? handleConfirm : null}
                loading={loading}
                onFuelClick={scrollToFuel}
              />

              {/* ★ 주유 영수증 첨부 — Task 2: onConfirm 전달 */}
              {(isPending || isPendingReview) && !isConfirmed && (
                <UserReceiptUpload
                  uploadReceipt={uploadReceipt}
                  isPendingReview={isPendingReview}
                  onConfirm={!isPendingReview ? handleConfirm : null}
                />
              )}

              {/* 확정 완료 */}
              {isConfirmed && <UserConfirmedBanner />}

              {/* Task 1: 연료 섹션 — ref 부착 */}
              <div ref={fuelSectionRef}>
                <UserFuelSection
                  readings={fuelReadings}
                  handoverFuelPct={MOCK_CONTRACT.handoverFuel}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 내가 낼 금액 카드
// ─────────────────────────────────────────────────────────────
function UserAmountCard({ settlement, onConfirm, loading, onFuelClick }) {
  const fmt = (n) => Number(n).toLocaleString('ko-KR');
  const {
    penalty_amount = 0,
    fuel_amount = 0,
    total_amount = 0,
    overdue_minutes = 0,
    fuel_diff_pct = 0,
    status,
  } = settlement;

  const statusMap = {
    pending:        { label: '정산 대기',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    pending_review: { label: '검토 중 🔍', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    confirmed:      { label: '확정됨',    cls: 'bg-green-100  text-green-700  border-green-200' },
    paid:           { label: '납부 완료', cls: 'bg-green-100  text-green-700  border-green-200' },
  };
  const { label, cls } = statusMap[status] || statusMap.pending;

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-100 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-olympos-blue to-blue-400" />
      <div className="p-5 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
            <h3 className="text-sm font-bold text-gray-900">내가 낼 금액</h3>
          </div>
          <span className={`badge border ${cls}`}>{label}</span>
        </div>

        {/* 금액 항목 */}
        <div className="space-y-2">
          {/* 반납 연장 요금 */}
          <AmountRow
            icon="⏰"
            label="반납 연장 요금"
            desc={
              overdue_minutes > 0
                ? `반납 예정 시간보다 ${overdue_minutes}분 늦게 반납되었습니다`
                : '반납 시간을 잘 지켜주셨습니다'
            }
            amount={penalty_amount}
            fmt={fmt}
            zero={penalty_amount === 0}
          />

          {/* Task 1 & Task 3: 주유 부족 요금 — 클릭 가능 + 문장형 설명 */}
          <AmountRow
            icon="⛽"
            label="주유 부족 요금"
            desc={
              fuel_diff_pct > 0
                ? `기준 대비 연료 약 ${Math.round(fuel_diff_pct)}% 부족하여 비용이 발생했습니다`
                : '연료 부족 없이 반납해 주셨습니다'
            }
            amount={fuel_amount}
            fmt={fmt}
            zero={fuel_amount === 0}
            onClick={fuel_amount > 0 ? onFuelClick : undefined}
          />

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between bg-gradient-to-r from-olympos-blue to-olympos-navy rounded-2xl px-4 py-3">
              <span className="text-sm font-bold text-white">총 납부 금액</span>
              <span className="text-lg font-black text-white">{fmt(total_amount)}원</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          * 반납 연장 요금은 30분 이내 반납 시 면제됩니다.<br />
          * 주유 부족 요금은 인수 시 연료량과 반납 시 연료량의 차이를 기준으로 계산됩니다.
        </p>

        {onConfirm && (
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-olympos-blue to-olympos-navy shadow-md shadow-blue-200 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? '처리 중…' : '정산 금액에 동의하고 확정 →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 금액 행 (Task 1: onClick 지원)
// ─────────────────────────────────────────────────────────────
function AmountRow({ icon, label, desc, amount, fmt, zero, onClick }) {
  const isClickable = Boolean(onClick);
  const Tag = isClickable ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={[
        'w-full text-left flex items-center justify-between p-3 rounded-xl transition-all',
        zero ? 'bg-gray-50' : 'bg-blue-50',
        isClickable ? 'cursor-pointer hover:brightness-95 active:scale-[0.99] group' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            {isClickable && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-olympos-blue bg-blue-100 rounded-full px-1.5 py-0.5 leading-none group-hover:bg-olympos-blue group-hover:text-white transition-colors">
                그래프
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-bold ${zero ? 'text-gray-400' : 'text-olympos-blue'}`}>
          {zero ? '0원' : `${fmt(amount)}원`}
        </span>
        {isClickable && (
          <svg className="w-3.5 h-3.5 text-olympos-blue opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────
// 주유 영수증 첨부 (Task 2: onConfirm 추가)
// ─────────────────────────────────────────────────────────────
function UserReceiptUpload({ uploadReceipt, isPendingReview, onConfirm }) {
  const [file,       setFile]       = useState(null);
  const [note,       setNote]       = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [err,        setErr]        = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((selected) => {
    setErr(null);
    const f = selected instanceof FileList ? selected[0] : selected;
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setErr('파일 크기는 10MB 이하여야 합니다.'); return; }
    setFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true); setProgress(0); setErr(null);
    try {
      await uploadReceipt(file, note, setProgress);
    } catch {
      setErr('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setUploading(false);
    }
  };

  if (isPendingReview) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
      <div className="p-5 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center gap-2">
          <span className="text-lg">📎</span>
          <h3 className="text-sm font-bold text-gray-900">주유 영수증 첨부</h3>
          <span className="ml-auto text-xs text-gray-400">이의 제기 시 사용</span>
        </div>

        {/* 안내 */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-purple-700 leading-relaxed">
            주유 영수증을 첨부하면 정산 금액이 <strong>운영자 검토 상태로 변경</strong>되며,
            확인 완료 전까지 <strong>자동 결제가 중단</strong>됩니다.
          </p>
        </div>

        {/* 드롭존 / 파일 미리보기 */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
              ${isDragOver ? 'border-purple-400 bg-purple-50 scale-[1.01]'
                           : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50'}`}
          >
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">파일을 드래그하거나 클릭하여 첨부</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, PDF · 최대 10MB</p>
            <input ref={inputRef} type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden" onChange={(e) => handleFile(e.target.files)} />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
            </div>
            <button onClick={() => { setFile(null); setProgress(0); }}
              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 이의 제기 사유 */}
        {file && !uploading && (
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">
              이의 제기 사유 <span className="text-gray-400 font-normal">(선택)</span>
            </span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="예: 반납 전 주유했는데 반영이 안 된 것 같습니다."
              className="mt-1.5 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5
                         focus:outline-none focus:border-purple-400 resize-none placeholder:text-gray-300" />
          </label>
        )}

        {/* 업로드 진행률 */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>업로드 중…</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {err && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>
        )}

        {/* 영수증 첨부 버튼 */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-all
            ${!file || uploading
              ? 'border-2 border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
              : 'border-2 border-olympos-blue text-olympos-blue bg-white hover:bg-olympos-blue-lt active:scale-[0.98]'}`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4 text-olympos-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              업로드 중…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              주유 영수증 첨부하기
            </span>
          )}
        </button>

        {!file && (
          <p className="text-xs text-gray-400 text-center">영수증이 없다면 첨부하지 않아도 됩니다</p>
        )}

        {/* ── Task 2: 바로 확정하기 버튼 ─────────────────────── */}
        {onConfirm && !file && !uploading && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300 font-medium">또는</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              onClick={onConfirm}
              className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-50
                         border border-gray-200 hover:bg-gray-100 hover:text-gray-700
                         active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              정산 내역에 동의하며 바로 확정하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 연료 변화 섹션 (Task 1: ref는 부모에서 부착)
// ─────────────────────────────────────────────────────────────
function UserFuelSection({ readings, handoverFuelPct }) {
  if (!readings || readings.length === 0) return null;
  const returnReading = readings.find((r) => r.is_return_reading);
  const returnFuel = returnReading?.smoothed_fuel_pct ?? returnReading?.raw_fuel_pct ?? null;

  // Task 3: 문장형 설명 계산
  const diffPct = returnFuel !== null ? handoverFuelPct - returnFuel : 0;
  const roundedDiff = Math.round(diffPct);
  const fuelDesc = diffPct > 0
    ? `대여 시보다 연료가 약 ${roundedDiff}% 부족하여 주유 부족 요금이 발생했습니다.`
    : '연료를 충분히 채워 반납해 주셨습니다.';

  return (
    <div className="space-y-2">
      {/* 연료 요약 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
          <h3 className="text-sm font-bold text-gray-900">주행 중 연료 변화</h3>
          <span className="ml-auto text-xs text-gray-400">센서 측정 기준</span>
        </div>

        {/* Task 3: 문장형 설명 문구 */}
        <p className={`text-xs leading-relaxed mb-3 font-medium ${diffPct > 0 ? 'text-orange-600' : 'text-green-600'}`}>
          {fuelDesc}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <FuelChip label="대여 시 연료" value={`${handoverFuelPct}%`} color="bg-blue-50 text-blue-700" />
          <div className="flex items-center justify-center text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <FuelChip
            label="반납 시 연료"
            value={returnFuel !== null ? `${returnFuel.toFixed(1)}%` : '-'}
            color={returnFuel !== null && returnFuel < handoverFuelPct ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}
          />
        </div>
      </div>

      {/* 연료 그래프 */}
      <FuelChart
        readings={readings}
        handoverFuelPct={handoverFuelPct}
        isEstimated={false}
        gapMinutes={0}
      />
    </div>
  );
}

function FuelChip({ label, value, color }) {
  return (
    <div className={`rounded-xl py-2.5 px-2 ${color}`}>
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 운영자 검토 중 배너
// ─────────────────────────────────────────────────────────────
function UserPendingBanner({ uploadedAt }) {
  const fmtTime = (d) => {
    if (!d) return '';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleString('ko-KR', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-orange-800">영수증 접수 완료 — 운영자 확인 중</p>
        {uploadedAt && (
          <p className="text-xs text-orange-600 mt-0.5">접수 시각: {fmtTime(uploadedAt)}</p>
        )}
        <p className="text-xs text-orange-600 mt-1.5 leading-relaxed">
          확인이 완료될 때까지 <strong>자동 결제가 중단</strong>됩니다.
          확인 후 최종 정산 결과를 알림으로 안내드릴게요.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 정산 확정 완료 배너
// ─────────────────────────────────────────────────────────────
function UserConfirmedBanner() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-green-800">정산이 확정되었습니다 ✅</p>
        <p className="text-xs text-green-600 mt-0.5">안내 문자로 납부 방법을 알려드릴게요.</p>
      </div>
    </div>
  );
}
