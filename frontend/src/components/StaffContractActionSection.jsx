/**
 * 고객 계약 요청 — 링크 발송 · 리마인드 · 미리보기 · QR (직원 모드)
 */

import { useMemo, useState } from 'react';
import { EvLightningIcon } from './EvLightningIcon';
import ActiveNotReturnedBadge from './ActiveNotReturnedBadge';
import { ALL_DEPLOYMENTS } from '../data/staffDeployments';
import { formatBranchStatusChip } from '../utils/formatBranchStatusChip';

const CONTRACT_SIGN_URL = 'https://fms.olympos.demo/contract/sign?token=demo';

function FakeQrGrid({ size = 21 }) {
  const cells = [];
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const dark =
      (row < 7 && col < 7) ||
      (row < 7 && col >= size - 7) ||
      (row >= size - 7 && col < 7) ||
      ((row * 17 + col * 13 + row * col) % 7 < 3);
    cells.push(
      <div key={i} className={dark ? 'bg-gray-900' : 'bg-white'} style={{ width: 6, height: 6 }} />,
    );
  }
  return (
    <div
      className="inline-grid gap-px bg-gray-300 p-1 rounded-lg border border-gray-200"
      style={{ gridTemplateColumns: `repeat(${size}, 6px)` }}
    >
      {cells}
    </div>
  );
}

function ContractWritingStatusBadges({ counts }) {
  const items = [
    { key: 'not_sent', label: '미발송', count: counts.not_sent, cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    { key: 'in_progress', label: '작성 중', count: counts.in_progress, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'completed', label: '작성 완료', count: counts.completed, cls: 'bg-green-50 text-green-700 border-green-200' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
      {items.map(({ key, label, count, cls }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}
        >
          {label}
          <span className="tabular-nums">{count}</span>
        </span>
      ))}
    </div>
  );
}

function SendContractLinkModal({
  open,
  onClose,
  deployments,
  selectedIds,
  toggleSelect,
  selectAllFiltered,
  search,
  setSearch,
  channel,
  setChannel,
  onSubmit,
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deployments.filter((d) => {
      if (!q) return true;
      return (
        d.customerName.toLowerCase().includes(q) ||
        d.plateNumber.replace(/\s/g, '').toLowerCase().includes(q.replace(/\s/g, ''))
      );
    });
  }, [deployments, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-[61] w-full max-w-[430px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-50">
          <div>
            <p className="text-[10px] font-bold text-olympos-blue uppercase tracking-wide">발송 대상 선택</p>
            <h4 className="text-sm font-bold text-gray-900 mt-0.5">계약서 링크 발송</h4>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 space-y-2 flex-shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="고객명 또는 차량번호 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:border-olympos-blue focus:ring-1 focus:ring-olympos-blue outline-none transition-all"
            />
          </div>
          <div className="flex justify-between items-center">
            <button type="button" onClick={() => selectAllFiltered(filtered.map((d) => d.id))} className="text-[10px] font-semibold text-olympos-blue hover:underline">
              검색 결과 전체 선택
            </button>
            <span className="text-[10px] text-gray-400">{filtered.length}명 표시 · 배차중만</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-1.5 min-h-[140px]">
          {filtered.map((d) => {
            const checked = selectedIds.has(d.id);
            return (
              <label
                key={d.id}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors
                  ${checked ? 'border-olympos-blue bg-olympos-blue-lt/40' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleSelect(d.id)} className="mt-1 rounded border-gray-300 text-olympos-blue focus:ring-olympos-blue" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">{d.customerName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{d.customerPhoneMasked}</p>
                  <div className="text-[10px] text-gray-400 mt-1 flex flex-col gap-1 min-w-0">
                    <span className="flex items-center gap-1 min-w-0">
                      {d.powertrain === 'ev' && (
                        <EvLightningIcon className="w-3 h-3 text-amber-500 flex-shrink-0" aria-hidden />
                      )}
                      <span className="font-mono tabular-nums truncate">{d.plateNumber}</span>
                      <span className="text-gray-300 flex-shrink-0">·</span>
                      <span className="truncate">{d.vehicleModel}</span>
                    </span>
                    {d.returnBranchName ? (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="inline-flex max-w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-800 tracking-tight break-words leading-snug">
                          {formatBranchStatusChip(d.contractStatus, d.returnBranchName)}
                        </span>
                        {d.contractStatus === 'active' ? <ActiveNotReturnedBadge /> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0
                  ${d.contractWritingStatus === 'not_sent' ? 'bg-gray-100 text-gray-600' : ''}
                  ${d.contractWritingStatus === 'in_progress' ? 'bg-amber-100 text-amber-700' : ''}
                  ${d.contractWritingStatus === 'completed' ? 'bg-green-100 text-green-700' : ''}`}
                >
                  {d.contractWritingStatus === 'not_sent' && '미발송'}
                  {d.contractWritingStatus === 'in_progress' && '작성중'}
                  {d.contractWritingStatus === 'completed' && '완료'}
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-xs text-gray-400 py-8">검색 결과가 없습니다.</p>}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80 space-y-3 flex-shrink-0 rounded-b-2xl">
          <p className="text-[10px] font-bold text-gray-500">전송 수단</p>
          <div className="flex gap-2">
            {[
              { id: 'alimtalk', label: '알림톡 발송' },
              { id: 'sms', label: 'SMS 발송' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setChannel(id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all
                  ${channel === id ? 'border-olympos-blue bg-white text-olympos-blue shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={onSubmit}
            className="w-full py-3 rounded-xl text-xs font-bold bg-olympos-blue text-white hover:bg-olympos-navy disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
          >
            발송하기 ({selectedIds.size}명)
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractPreviewModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative z-[61] w-full max-w-[430px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100 max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-bold text-gray-900">계약서 미리보기</h4>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2">
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-3 text-xs">
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
            <p className="text-[10px] font-bold text-olympos-blue">보험대차 표준 계약서 v3.2</p>
            <p className="text-gray-700 leading-relaxed font-medium">제1조 (목적) 본 계약은 피보험자의 소유·관리 차량의 보험대차에 따른 대여 조건을 규정합니다.</p>
            <p className="text-gray-600 leading-relaxed">제2조 (대여 기간) 계약서상 명시된 인도일시부터 반납일시까지이며, 연장 시 별도 동의가 필요합니다.</p>
            <p className="text-gray-600 leading-relaxed">제3조 (차량 반환) 연료·외관·부속품 상태를 인도 시와 동일하게 반환해야 하며, 과태료는 이용자 부담입니다.</p>
            <div className="h-24 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400">전자 서명 영역 (고객 화면 동일)</div>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            실제 발송 시 고객에게 노출되는 순서·항목과 동일하게 렌더링됩니다. 최종 문안은 법무 검토본과 일치합니다.
          </p>
        </div>
        <div className="p-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl text-xs font-bold border-2 border-olympos-blue text-olympos-blue hover:bg-olympos-blue-lt">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function QrCodeModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative z-[61] w-full max-w-[430px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-900">현장용 QR 코드</h4>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <FakeQrGrid />
          <div className="w-full bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] text-gray-400 mb-1">연결 URL</p>
            <p className="text-[11px] font-mono text-olympos-blue break-all">{CONTRACT_SIGN_URL}</p>
          </div>
          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            고객이 스캔하면 동일한 계약 작성 페이지로 이동합니다. 현장 태블릿과 페어링된 세션으로 로깅됩니다.
          </p>
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl text-xs font-bold bg-olympos-blue text-white">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderModal({ open, onClose, targets, selectedIds, toggleSelect, onSend }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative z-[61] w-full max-w-[430px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100 max-h-[80vh] flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b border-gray-50">
          <h4 className="text-sm font-bold text-gray-900">미작성 리마인드</h4>
          <p className="text-[10px] text-gray-400 mt-1">링크 발송 후 아직 제출 전인 고객에게 재알림을 보냅니다.</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {targets.map((d) => (
            <label
              key={d.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer ${selectedIds.has(d.id) ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100'}`}
            >
              <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleSelect(d.id)} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900">{d.customerName}</p>
                <p className="text-[10px] text-gray-500">{d.customerPhoneMasked}</p>
              </div>
            </label>
          ))}
          {targets.length === 0 && <p className="text-center text-xs text-gray-400 py-6">미작성 대상이 없습니다.</p>}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600">
            취소
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0 || targets.length === 0}
            onClick={onSend}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
          >
            리마인드 발송 ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffContractActionSection() {
  const activeDeployments = useMemo(() => ALL_DEPLOYMENTS.filter((d) => d.contractStatus === 'active'), []);

  const [writingById, setWritingById] = useState(() => {
    const m = {};
    ALL_DEPLOYMENTS.forEach((d) => {
      m[d.id] = d.contractWritingStatus;
    });
    return m;
  });

  const deploymentsWithWriting = useMemo(
    () =>
      ALL_DEPLOYMENTS.map((d) => ({
        ...d,
        contractWritingStatus: writingById[d.id] ?? d.contractWritingStatus,
      })),
    [writingById],
  );

  const activeWithWriting = useMemo(
    () => deploymentsWithWriting.filter((d) => d.contractStatus === 'active'),
    [deploymentsWithWriting],
  );

  const writingCounts = useMemo(() => {
    let not_sent = 0;
    let in_progress = 0;
    let completed = 0;
    deploymentsWithWriting.forEach((d) => {
      const s = d.contractWritingStatus;
      if (s === 'not_sent') not_sent += 1;
      else if (s === 'in_progress') in_progress += 1;
      else completed += 1;
    });
    return { not_sent, in_progress, completed };
  }, [deploymentsWithWriting]);

  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const [sendSearch, setSendSearch] = useState('');
  const [sendSelected, setSendSelected] = useState(() => new Set());
  const [sendChannel, setSendChannel] = useState('alimtalk');

  const [reminderSelected, setReminderSelected] = useState(() => new Set());

  const [sentFlash, setSentFlash] = useState(false);
  const [lastSendMessage, setLastSendMessage] = useState('');

  const reminderTargets = useMemo(
    () => deploymentsWithWriting.filter((d) => d.contractWritingStatus === 'in_progress'),
    [deploymentsWithWriting],
  );

  const openSendModal = () => {
    setSendSearch('');
    setSendSelected(new Set());
    setSendChannel('alimtalk');
    setSendModalOpen(true);
  };

  const toggleSendSelect = (id) => {
    setSendSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFilteredInModal = (ids) => {
    setSendSelected(new Set(ids));
  };

  const handleSubmitSend = () => {
    const ids = [...sendSelected];
    const names = activeWithWriting.filter((d) => ids.includes(d.id)).map((d) => d.customerName);
    const chLabel = sendChannel === 'alimtalk' ? '알림톡' : 'SMS';

    setWritingById((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        const cur = next[id];
        if (cur === 'not_sent') next[id] = 'in_progress';
      });
      return next;
    });

    setLastSendMessage(`${names.join(', ')} 님에게 ${chLabel}으로 계약서 작성 링크가 발송되었습니다.`);
    setSentFlash(true);
    setSendModalOpen(false);
    window.setTimeout(() => setSentFlash(false), 4500);
  };

  const toggleReminderSelect = (id) => {
    setReminderSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openReminder = () => {
    setReminderSelected(new Set(reminderTargets.map((d) => d.id)));
    setReminderOpen(true);
  };

  const handleReminderSend = () => {
    const names = reminderTargets.filter((d) => reminderSelected.has(d.id)).map((d) => d.customerName);
    setLastSendMessage(names.length ? `${names.join(', ')} 님에게 미작성 리마인드(알림톡)가 발송되었습니다.` : '리마인드를 발송했습니다.');
    setSentFlash(true);
    setReminderOpen(false);
    window.setTimeout(() => setSentFlash(false), 4500);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 border-b border-gray-50">
          <span className="w-1 h-4 rounded-full bg-olympos-blue inline-block flex-shrink-0" />
          <h3 className="text-xs font-bold text-gray-900">고객 계약 요청</h3>
          <span className="ml-auto text-[9px] text-gray-400 bg-gray-50 rounded-full px-2 py-0.5 border border-gray-100 flex-shrink-0">
            보험대차
          </span>
        </div>

        <div className="p-3 space-y-3">
          <ContractWritingStatusBadges counts={writingCounts} />

          <p className="text-[10px] text-gray-400 leading-relaxed">
            발송 대상을 선택한 뒤 알림톡 또는 SMS로 계약 링크를 전달합니다. 작성 진행 상태는 아래 배지로 실시간 집계됩니다.
          </p>

          <button
            type="button"
            onClick={openSendModal}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.98] shadow-sm
              ${sentFlash ? 'bg-green-500 text-white shadow-green-200' : 'bg-olympos-blue text-white hover:bg-olympos-navy shadow-blue-200'}`}
          >
            {sentFlash ? (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                발송 완료
              </>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                계약서 링크 발송
              </>
            )}
          </button>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={openReminder}
              className="flex items-center justify-between gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-left hover:border-amber-300 hover:bg-amber-50/30 transition-all active:scale-[0.99]"
            >
              <span className="text-xs font-bold text-gray-800">미작성 리마인드</span>
              <span className="text-[10px] font-semibold text-amber-600">{reminderTargets.length}명 대상</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="rounded-xl border-2 border-olympos-blue bg-white py-2.5 text-xs font-bold text-olympos-blue hover:bg-olympos-blue-lt transition-all"
              >
                계약서 미리보기
              </button>
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="rounded-xl border-2 border-olympos-blue bg-white py-2.5 text-xs font-bold text-olympos-blue hover:bg-olympos-blue-lt transition-all"
              >
                QR 코드 생성
              </button>
            </div>
          </div>

          {sentFlash && lastSendMessage && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[11px] text-green-800 font-semibold leading-relaxed">{lastSendMessage}</p>
            </div>
          )}
        </div>
      </div>

      <SendContractLinkModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        deployments={activeWithWriting}
        selectedIds={sendSelected}
        toggleSelect={toggleSendSelect}
        selectAllFiltered={selectAllFilteredInModal}
        search={sendSearch}
        setSearch={setSendSearch}
        channel={sendChannel}
        setChannel={setSendChannel}
        onSubmit={handleSubmitSend}
      />

      <ContractPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
      <QrCodeModal open={qrOpen} onClose={() => setQrOpen(false)} />

      <ReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        targets={reminderTargets}
        selectedIds={reminderSelected}
        toggleSelect={toggleReminderSelect}
        onSend={handleReminderSend}
      />
    </>
  );
}
