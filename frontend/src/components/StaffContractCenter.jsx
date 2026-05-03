/**
 * 직원 계약 관리 센터 — 상태 필터 · 리마인드 · 일괄 다운로드(데모)
 */

import { useCallback, useMemo, useState } from 'react';
import { EvLightningIcon } from './EvLightningIcon';
import ActiveNotReturnedBadge from './ActiveNotReturnedBadge';
import {
  STAFF_CONTRACT_RECORDS,
  CONTRACT_FLOW_LABELS,
  CONTRACT_FLOW_BADGE,
} from '../data/staffContractRecords';
import { formatBranchStatusChip } from '../utils/formatBranchStatusChip';

const FILTER_CHIPS = [
  { id: 'all', label: '전체' },
  { id: 'pending_signature', label: '서명대기' },
  { id: 'signed', label: '서명완료' },
  { id: 'sent_insurer', label: '보험사전송완료' },
];

function filterRecords(list, chipId) {
  if (chipId === 'all') return list;
  return list.filter((r) => r.eSignStatus === chipId);
}

export default function StaffContractCenter() {
  const [chip, setChip] = useState('all');
  const [selected, setSelected] = useState(() => new Set());
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => filterRecords(STAFF_CONTRACT_RECORDS, chip), [chip]);

  const counts = useMemo(() => {
    const base = { all: STAFF_CONTRACT_RECORDS.length };
    FILTER_CHIPS.forEach(({ id }) => {
      if (id === 'all') return;
      base[id] = STAFF_CONTRACT_RECORDS.filter((r) => r.eSignStatus === id).length;
    });
    return base;
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = () => {
    const ids = filtered.map((r) => r.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectedRecords = STAFF_CONTRACT_RECORDS.filter((r) => selected.has(r.id));

  const handleBulkDownload = () => {
    const n = selectedRecords.length;
    if (n === 0) {
      showToast('선택된 계약이 없습니다. 체크박스로 항목을 선택해 주세요.');
      return;
    }
    showToast(`선택한 ${n}건의 계약서 일괄 다운로드를 시작했습니다. (데모)`);
  };

  const handleReminder = () => {
    showToast('고객님께 서명 요청 알림톡을 재발송했습니다');
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  return (
    <div className="space-y-3">
      {/* 요약 + 일괄 다운로드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold text-olympos-blue uppercase tracking-wide">
              워크플로우
            </p>
            <h2 className="text-sm font-bold text-gray-900 mt-0.5">전자계약 · 보험 전송</h2>
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
              필터로 상태별 계약을 확인하고, 서명 대기 건에 리마인드를 보낼 수 있습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBulkDownload}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-olympos-blue
                     hover:bg-olympos-navy shadow-md shadow-blue-200 active:scale-[0.98] transition-all
                     flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          계약서 일괄 다운로드
          {selectedRecords.length > 0 && (
            <span className="text-[11px] font-extrabold bg-white/20 rounded-full px-2 py-0.5">
              {selectedRecords.length}건 선택
            </span>
          )}
        </button>

        {/* 상태 칩 */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
          {FILTER_CHIPS.map(({ id, label }) => {
            const active = chip === id;
            const count = id === 'all' ? counts.all : counts[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setChip(id)}
                className={`flex-shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all
                  ${active
                    ? 'bg-olympos-blue text-white shadow-sm shadow-blue-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {label}
                <span
                  className={`text-[9px] font-bold rounded-full px-1 leading-tight tabular-nums
                  ${active ? 'bg-white/25 text-white' : 'bg-white text-gray-500'}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 전체 선택 */}
        <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleAllFiltered}
            className="rounded border-gray-300 text-olympos-blue focus:ring-olympos-blue"
          />
          현재 목록 전체 선택 ({filtered.length}건)
        </label>
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-50">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-4 rounded-full bg-olympos-blue inline-block" />
            <h3 className="text-xs font-bold text-gray-900">계약 목록</h3>
          </div>
          <span className="text-[10px] text-gray-400">{filtered.length}건</span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              해당 상태의 계약이 없습니다.
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 flex gap-2 items-start hover:bg-gray-50/80 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggleOne(r.id)}
                  className="mt-1 rounded border-gray-300 text-olympos-blue focus:ring-olympos-blue flex-shrink-0"
                  aria-label={`${r.customerName} 계약 선택`}
                />
                <div className="flex-1 min-w-0 space-y-1 leading-snug">
                  <div className="flex items-start gap-1">
                    {r.powertrain === 'ev' ? (
                      <EvLightningIcon className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden />
                    ) : null}
                    <span className="text-[11px] font-bold text-gray-900">{r.vehicleModel}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-800 font-mono tabular-nums tracking-tight">
                    {r.plateNumber}
                  </p>
                  {r.returnBranchName && r.deploymentContractStatus ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="inline-flex max-w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-800 tracking-tight break-words leading-snug">
                        {formatBranchStatusChip(r.deploymentContractStatus, r.returnBranchName)}
                      </span>
                      {r.deploymentContractStatus === 'active' ? <ActiveNotReturnedBadge /> : null}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-0.5 border-t border-gray-50/90">
                    <span className="font-bold text-gray-900">{r.customerName}</span>
                    <span className="text-gray-400 font-mono">{r.contractNo}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">{r.periodLabel}</p>

                  <div className="flex flex-wrap items-center gap-2 justify-between pt-0.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${CONTRACT_FLOW_BADGE[r.eSignStatus]}`}
                    >
                      {CONTRACT_FLOW_LABELS[r.eSignStatus]}
                    </span>
                    {r.eSignStatus === 'pending_signature' && (
                      <button
                        type="button"
                        onClick={() => handleReminder()}
                        className="text-[10px] font-bold text-olympos-blue border border-olympos-blue rounded-xl px-2.5 py-1
                                   hover:bg-olympos-blue-lt active:scale-[0.97] transition-all flex-shrink-0"
                      >
                        리마인드 발송
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-[70] bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] w-[min(92%,400px)] pointer-events-none px-2">
          <div className="rounded-2xl bg-gray-900 text-white text-center text-sm font-bold px-4 py-3 shadow-xl border border-gray-700">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
