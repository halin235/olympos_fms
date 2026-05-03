import StatusBadge from './ui/StatusBadge';

const fmt = (n) => Number(n).toLocaleString('ko-KR') + '원';

// ─────────────────────────────────────────────────────────────
// 통신 장애 추정치 경고 배너
// ─────────────────────────────────────────────────────────────
function EstimatedWarningBanner({ note }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-orange-50 border border-orange-200
                    px-4 py-3 shadow-sm">
      <div className="mt-0.5 w-5 h-5 rounded-full bg-orange-100 border border-orange-300
                      flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-orange-700 mb-0.5">통신 장애로 인한 추정치</p>
        <p className="text-xs text-orange-600 leading-relaxed break-words">
          {note || 'GPS/OBD 데이터 공백이 감지되어 마지막 수신 데이터 기준으로 산출되었습니다. 분쟁 시 운행 기록지를 추가 확인하세요.'}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 정산 항목 행
// ─────────────────────────────────────────────────────────────
function AmountRow({ label, amount, sub, highlight, isEstimated }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all
      ${highlight
        ? 'bg-gradient-to-r from-olympos-blue to-olympos-navy text-white shadow-md shadow-blue-200'
        : isEstimated
          ? 'bg-orange-50 border border-orange-200'
          : 'bg-gray-50 border border-gray-100'}`}>
      <div className="min-w-0 flex-1 mr-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-bold
            ${highlight ? 'text-white' : isEstimated ? 'text-orange-700' : 'text-gray-700'}`}>
            {label}
          </p>
          {isEstimated && !highlight && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                             bg-orange-100 text-orange-600 border border-orange-200 whitespace-nowrap">
              추정
            </span>
          )}
        </div>
        {sub && (
          <p className={`text-xs mt-0.5 leading-relaxed
            ${highlight ? 'text-blue-100' : 'text-gray-400'}`}>
            {sub}
          </p>
        )}
      </div>
      <p className={`text-base font-extrabold tabular-nums whitespace-nowrap flex-shrink-0
        ${highlight ? 'text-white' : amount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
        {amount > 0 ? fmt(amount) : '없음'}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────
export default function SettlementSummaryCard({ settlement, onConfirm, loading }) {
  if (!settlement) return null;

  const {
    status,
    overdue_minutes,
    grace_period_minutes,
    billable_30min_units,
    penalty_rate,
    penalty_amount,
    handover_fuel_pct,
    return_fuel_pct,
    fuel_diff_pct,
    fuel_diff_liters,
    fuel_price_per_liter,
    fuel_amount,
    total_amount,
    confirmed_by,
    confirmed_at,
    is_estimated,
    data_gap_minutes,
    estimation_note,
  } = settlement;

  const penaltySub = billable_30min_units > 0
    ? `연체 ${overdue_minutes}분 · Grace ${grace_period_minutes}분 제외 · ${billable_30min_units}단위 × ${Number(penalty_rate).toLocaleString()}원`
    : `Grace Period(${grace_period_minutes}분) 이내 반납 — 면제`;

  const fuelSub =
    `인수 ${handover_fuel_pct}% → 반납 ${return_fuel_pct}% ` +
    `(차이 ${Math.abs(fuel_diff_pct)}%) · ${Math.abs(fuel_diff_liters)}L × ${Number(fuel_price_per_liter).toLocaleString()}원/L`;

  return (
    <section className="bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-100 p-5 space-y-4">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
          <h3 className="text-base font-bold text-gray-900">자동 정산 리포트</h3>
          {is_estimated && (
            <span className="badge bg-orange-100 text-orange-700 border border-orange-200 text-xs">
              추정 정산
            </span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* 추정치 경고 배너 */}
      {is_estimated && (
        <EstimatedWarningBanner note={estimation_note} />
      )}

      {/* 정산 항목 */}
      <div className="space-y-2.5">
        <AmountRow
          label="연체료"
          amount={Number(penalty_amount)}
          sub={penaltySub}
          isEstimated={is_estimated && billable_30min_units > 0}
        />
        <AmountRow
          label="연료 부족액"
          amount={Number(fuel_amount)}
          sub={fuelSub}
          isEstimated={is_estimated && Number(fuel_amount) > 0}
        />

        {/* 총합계 — 강조 */}
        <AmountRow
          label="총 정산 금액"
          amount={Number(total_amount)}
          highlight
          isEstimated={is_estimated}
        />
      </div>

      {/* OBD 공백 안내 (공백 있을 때만) */}
      {is_estimated && data_gap_minutes > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>OBD 최대 공백: <strong className="text-gray-700">{data_gap_minutes}분</strong></span>
        </div>
      )}

      {/* 확정 정보 */}
      {status === 'confirmed' && confirmed_by && (
        <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{confirmed_by} 확정 · {new Date(confirmed_at).toLocaleString('ko-KR')}</span>
        </div>
      )}

      {/* 정산 확정 버튼 */}
      {status === 'pending' && onConfirm && (
        <div className="space-y-2 pt-1">
          {is_estimated && (
            <p className="text-xs text-orange-600 text-center">
              추정치를 포함한 정산입니다. 확정 전 데이터를 검토하세요.
            </p>
          )}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all
                       bg-gradient-to-r from-olympos-blue to-olympos-navy
                       shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300
                       active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                처리 중…
              </span>
            ) : '정산 확정하기'}
          </button>
        </div>
      )}
    </section>
  );
}
