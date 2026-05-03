/**
 * 직원 홈 탭 본문 — StaffShellPage에서 헤더·하단 탭과 분리되어 렌더됩니다.
 *
 * Task 1: 운영 KPI 3종 카드 최상단 배치
 * Task 2: 배차 리스트 4탭 필터 + 연료 상태 바 + 고객명
 * Task 3: pending_review 건 [검토 필요] 반짝 배지
 * Task 4: 고객 모드로 전환 버튼 (하단)
 */

import { useMemo, useState } from 'react';
import { EvLightningIcon } from '../components/EvLightningIcon';
import { ALL_DEPLOYMENTS } from '../data/staffDeployments';
import { DEMO_DATE } from '../constants/demoTimeline';

// ─────────────────────────────────────────────────────────────
// Mock 데이터
// ─────────────────────────────────────────────────────────────
const KPI = {
  unreturned:  1,   // 미반납 차량 (스파크)
  fuelDeficit: 1,   // 연료 부족 정산 (쏘나타)
  todayReturn: 2,   // 오늘 반납 예정 (테슬라 모델 3 · 쏘나타, 26.05.03)
};

const VEHICLE_STATS = { waiting: 2, repair: 0, staff: 0, total: 5, rotationPct: 52 };

const MONTHLY_STATS = [
  { label: '이번 달 총 배차',  value: '5건',       color: 'text-olympos-blue' },
  { label: '정산 완료',        value: '1건',       color: 'text-green-600'   },
  { label: '정산 대기',        value: '1건',        color: 'text-yellow-600'  },
  { label: '이의 제기',        value: '0건',        color: 'text-gray-500'     },
  { label: '총 정산 금액',     value: '₩182,400',   color: 'text-gray-900'    },
  { label: '미처리 건수',      value: '1건',        color: 'text-orange-500'  },
];

// ─────────────────────────────────────────────────────────────
// 필터 함수
// ─────────────────────────────────────────────────────────────
function filterDeployments(list, filter) {
  if (filter === '전체') return list;
  if (filter === '운행중') return list.filter((d) => d.contractStatus === 'active');
  if (filter === '반납완료') {
    return list.filter(
      (d) =>
        d.contractStatus === 'returned' &&
        d.settlementStatus !== 'pending' &&
        d.settlementStatus !== 'pending_review',
    );
  }
  if (filter === '정산대기') {
    return list.filter((d) => d.settlementStatus === 'pending' || d.settlementStatus === 'pending_review');
  }
  return list;
}

/** 긴급도 점수: 미반납(active+연체) > 연료 부족 > 정산 대기 */
function urgencyScore(d) {
  let s = 0;
  if (d.contractStatus === 'active' && d.overdueReturn) s += 300;
  if (d.fuelPct < 30) s += 200;
  else if (d.fuelPct < 60) s += 70;
  if (d.settlementStatus === 'pending_review') s += 160;
  if (d.settlementStatus === 'pending') s += 130;
  if (d.contractStatus === 'returned' && (d.settlementStatus === 'pending' || d.settlementStatus === 'pending_review')) {
    s += 90;
  }
  return s;
}

function applyUrgencyChip(list, chip) {
  if (chip == null) return list;
  if (chip === 'overdue') {
    return list.filter((d) => d.contractStatus === 'active' && d.overdueReturn);
  }
  if (chip === 'fuel_low') return list.filter((d) => d.fuelPct < 30);
  if (chip === 'settlement_pending') {
    return list.filter((d) => d.settlementStatus === 'pending' || d.settlementStatus === 'pending_review');
  }
  return list;
}

function sortDeployments(list, sortMode) {
  const copy = [...list];
  if (sortMode === 'urgency') {
    copy.sort((a, b) => urgencyScore(b) - urgencyScore(a) || a.fuelPct - b.fuelPct);
  } else if (sortMode === 'newest') {
    copy.sort((a, b) => (b.createdOrder ?? 0) - (a.createdOrder ?? 0));
  } else if (sortMode === 'fuel_low') {
    copy.sort((a, b) => a.fuelPct - b.fuelPct);
  }
  return copy;
}

// ─────────────────────────────────────────────────────────────
// Task 1: KPI 요약 카드 행
// ─────────────────────────────────────────────────────────────
function KpiRow() {
  const cards = [
    { label: '미반납 차량',    value: KPI.unreturned,  unit: '건', bg: 'bg-red-50',    border: 'border-red-200',    num: 'text-red-600',    icon: RedCarIcon    },
    { label: '연료부족 정산',  value: KPI.fuelDeficit, unit: '건', bg: 'bg-orange-50', border: 'border-orange-200', num: 'text-orange-600', icon: FuelAlertIcon  },
    { label: '오늘 반납예정',  value: KPI.todayReturn, unit: '건', bg: 'bg-blue-50',   border: 'border-blue-200',   num: 'text-olympos-blue', icon: CalendarIcon },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {cards.map(({ label, value, unit, bg, border, num, icon: Icon }) => (
        <div key={label} className={`${bg} border ${border} rounded-xl p-2.5 flex flex-col gap-0.5`}>
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[9px] text-gray-500 font-semibold leading-tight">{label}</p>
            <Icon />
          </div>
          <p className={`text-xl font-black ${num} leading-none`}>
            {value}<span className="text-[10px] font-semibold ml-0.5">{unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

// KPI 아이콘
function RedCarIcon() {
  return (
    <div className="w-4 h-4 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
  );
}
function FuelAlertIcon() {
  return (
    <div className="w-4 h-4 rounded bg-orange-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-2.5 h-2.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm9 4a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd"/>
      </svg>
    </div>
  );
}
function CalendarIcon() {
  return (
    <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-2.5 h-2.5 text-olympos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Task 2 & 3: 배차 리스트 섹션 (필터 탭 + 아이템)
// ─────────────────────────────────────────────────────────────
const FILTER_TABS = ['전체', '운행중', '반납완료', '정산대기'];

const URGENCY_CHIPS = [
  { id: 'overdue', label: '미반납' },
  { id: 'fuel_low', label: '연료 부족' },
  { id: 'settlement_pending', label: '정산 대기' },
];

const SORT_OPTIONS = [
  { id: 'urgency', label: '긴급도 높은 순' },
  { id: 'newest', label: '최신순' },
  { id: 'fuel_low', label: '잔여 연료 낮은 순' },
];

function DeploymentSection({ onDetailClick }) {
  const [filter, setFilter] = useState('전체');
  const [urgencyChip, setUrgencyChip] = useState(null);
  const [sortMode, setSortMode] = useState('urgency');

  const tabFiltered = filterDeployments(ALL_DEPLOYMENTS, filter);
  const chipFiltered = applyUrgencyChip(tabFiltered, urgencyChip);
  const list = sortDeployments(chipFiltered, sortMode);

  const counts = {
    전체:    ALL_DEPLOYMENTS.length,
    운행중:  ALL_DEPLOYMENTS.filter((d) => d.contractStatus === 'active').length,
    반납완료: ALL_DEPLOYMENTS.filter(
      (d) =>
        d.contractStatus === 'returned' &&
        d.settlementStatus !== 'pending' &&
        d.settlementStatus !== 'pending_review',
    ).length,
    정산대기: ALL_DEPLOYMENTS.filter((d) =>
      d.settlementStatus === 'pending' || d.settlementStatus === 'pending_review').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-4 rounded-full bg-olympos-blue inline-block" />
          <h3 className="text-xs font-bold text-gray-900">배차 현황</h3>
        </div>
        <span className="text-[10px] text-gray-400">{list.length}건 표시 중</span>
      </div>

      {/* 상태 탭 */}
      <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const isActive = filter === tab;
          const count    = counts[tab] ?? 0;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`flex-shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all
                ${isActive
                  ? 'bg-olympos-blue text-white shadow-sm shadow-blue-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {tab}
              <span className={`text-[9px] font-bold rounded-full px-1 leading-tight
                ${isActive ? 'bg-white/25 text-white' : 'bg-white text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 긴급도 칩 + 정렬 */}
      <div className="px-3 pb-2 space-y-2 border-b border-gray-50">
        <div className="flex flex-wrap gap-1">
          {URGENCY_CHIPS.map(({ id, label }) => {
            const active = urgencyChip === id;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setUrgencyChip((prev) => (prev === id ? null : id))}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold border transition-all
                  ${active
                    ? 'bg-olympos-blue-lt border-olympos-blue text-olympos-blue'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-semibold whitespace-nowrap">정렬</span>
          <div className="flex flex-wrap gap-1 flex-1">
            {SORT_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSortMode(id)}
                className={`rounded-lg px-2 py-1 text-[10px] font-semibold border transition-all
                  ${sortMode === id
                    ? 'border-olympos-blue bg-white text-olympos-blue shadow-sm'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 배차 아이템 목록 */}
      <div className="divide-y divide-gray-50">
        {list.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            해당 조건의 배차 건이 없습니다.
          </div>
        ) : (
          list.map((d) => (
            <DeploymentItem key={d.id} data={d} onClick={() => onDetailClick?.(d.id)} />
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Task 2 & 3: 개별 배차 아이템
// ─────────────────────────────────────────────────────────────
function DeploymentItem({ data, onClick }) {
  const {
    employee, contractNo, contractStatus, settlementStatus,
    vehicleModel, vehicleListTitle, plateNumber, startAt, endAt, customerName, fuelPct,
    overdueReturn,
    powertrain,
    dropoffBranchLabel,
    returnCompletedBranchLabel,
  } = data;

  const isEv = powertrain === 'ev';
  const vehicleHeadline = vehicleListTitle ?? vehicleModel;

  // 계약 상태 배지
  const statusBadge = {
    active:   { label: '운행중',  cls: 'bg-olympos-blue text-white'            },
    returned: { label: '반납완료', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    settled:  { label: '정산완료', cls: 'bg-green-100  text-green-700  border border-green-200'  },
  }[contractStatus] ?? { label: contractStatus, cls: 'bg-gray-100 text-gray-600' };

  // 연료 / 배터리 SOC 색상·라벨
  const fuelColor = fuelPct >= 60 ? '#10B981' : fuelPct >= 30 ? '#F59E0B' : '#EF4444';
  const fuelLabel = isEv
    ? fuelPct >= 60 ? '충분' : fuelPct >= 30 ? '보통' : '저전력'
    : fuelPct >= 60 ? '여유' : fuelPct >= 30 ? '보통' : '부족';
  const fuelLabelCls = fuelPct >= 60 ? 'text-green-600' : fuelPct >= 30 ? 'text-amber-600' : 'text-red-500';

  const isReviewPending = settlementStatus === 'pending_review';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors group"
    >
      <div className="min-w-0">
        {/* 차종 — 리스트 최상단 */}
        <div className="flex items-start gap-1 mb-0.5">
          {isEv ? (
            <EvLightningIcon className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden />
          ) : null}
          <span className="text-[11px] font-bold text-gray-900 leading-snug">{vehicleHeadline}</span>
        </div>

        {/* 번호판 · 상태 */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className="text-[10px] font-semibold text-gray-800 font-mono tabular-nums tracking-tight whitespace-nowrap"
              title={plateNumber}
            >
              {plateNumber}
            </span>
            <span className={`badge text-[9px] px-1.5 py-0.5 ${statusBadge.cls}`}>
              {statusBadge.label}
            </span>
            {contractStatus === 'returned' &&
              (settlementStatus === 'pending' || settlementStatus === 'pending_review') && (
              <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0">
                정산 대기
              </span>
            )}
            {contractStatus === 'returned' && returnCompletedBranchLabel && (
              <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-1.5 py-0">
                {returnCompletedBranchLabel}
              </span>
            )}
            {contractStatus === 'active' && overdueReturn && (
              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0">
                미반납
              </span>
            )}
          </div>
          {isReviewPending && (
            <span className="flex-shrink-0 flex items-center gap-1 bg-orange-500 text-white
                             text-[9px] font-bold rounded-full px-2 py-0.5 leading-none shadow-sm">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse inline-block" />
              검토 필요
            </span>
          )}
        </div>

        {/* 고객명 + 담당자 + 기간 */}
        <div className="flex items-center gap-1.5 mb-0.5 text-[10px]">
          <span className="text-gray-700 font-medium truncate">{customerName}</span>
          <span className="text-gray-300 flex-shrink-0">·</span>
          <span className="text-gray-500 flex-shrink-0">{employee}</span>
          <span className="ml-auto text-gray-400 font-mono tabular-nums whitespace-nowrap">{startAt} → {endAt}</span>
        </div>

        {contractStatus === 'active' && dropoffBranchLabel && (
          <div className="flex items-center gap-1 mb-0.5 text-[9px] text-slate-600 font-semibold">
            <span aria-hidden className="text-[10px]">
              📍
            </span>
            <span>
              반납 예정 : {dropoffBranchLabel}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5 mb-px">
          <span className="text-[9px] text-gray-500 font-semibold tracking-tight">
            {isEv ? '배터리 잔량' : '잔여 연료'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${fuelPct}%`, backgroundColor: fuelColor }}
            />
          </div>
          <span className={`text-[9px] font-bold ${fuelLabelCls} w-7 text-right tabular-nums`}>{fuelPct}%</span>
          <span className={`text-[9px] ${fuelLabelCls} whitespace-nowrap`}>({fuelLabel})</span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 차량현황 카드
// ─────────────────────────────────────────────────────────────
function VehicleStatusCard() {
  const { waiting, repair, staff, rotationPct } = VEHICLE_STATS;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1 h-4 rounded-full bg-olympos-blue inline-block" />
        <h3 className="text-xs font-bold text-gray-900">차량 현황</h3>
      </div>
      <div className="flex items-center gap-5">
        {/* 도넛 차트 */}
        <div className="relative flex-shrink-0">
          <svg width="64" height="64" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
            <circle cx="36" cy="36" r="28" fill="none"
              stroke="#1B4FBF" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 28 * rotationPct / 100} ${2 * Math.PI * 28 * (1 - rotationPct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-extrabold text-olympos-blue">{rotationPct}%</span>
            <span className="text-[8px] text-gray-400 leading-none text-center">회전율</span>
          </div>
        </div>
        <div className="flex gap-5">
          {[
            { label: '대기중',  value: waiting, color: 'text-gray-800' },
            { label: '수리중',  value: repair,  color: 'text-red-500'  },
            { label: '직원사용', value: staff,   color: 'text-blue-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 월통계 카드
// ─────────────────────────────────────────────────────────────
function MonthlyStatsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-1 h-4 rounded-full bg-olympos-blue inline-block" />
        <h3 className="text-xs font-bold text-gray-900">5월 통계</h3>
        <span className="ml-auto text-[9px] text-gray-400 bg-gray-50 rounded-full px-2 py-0.5 border border-gray-100">
          {DEMO_DATE.slice(0, 7)} 기준
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MONTHLY_STATS.map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <p className="text-[9px] text-gray-400 mb-0.5 leading-tight">{label}</p>
            <p className={`text-sm font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// 홈 탭 본문 (StaffShellPage 고정 헤더·하단 탭 안에서만 렌더)
// ─────────────────────────────────────────────────────────────
export function StaffDashboardTabContent({ navigate }) {
  return (
    <>
      {/* ── 히어로 배너 (초슬림) ── */}
      <div className="relative bg-gradient-to-r from-[#1B4FBF] to-[#0F2B6B] overflow-hidden">
        <div className="relative px-4 pt-2.5 pb-3 text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-300 font-medium">OLYMPOS FMS · {DEMO_DATE} (일)</p>
            <p className="text-sm font-bold mt-0.5 tracking-tight">실시간 운영 요약</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-blue-300">총 배차</p>
            <p className="text-lg font-black text-white">{ALL_DEPLOYMENTS.length}<span className="text-xs font-semibold ml-0.5">건</span></p>
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="px-3 mt-1 pb-6 space-y-2">
        <KpiRow />
        <DeploymentSection
          onDetailClick={(deploymentId) => navigate?.('detail', undefined, { deploymentId })}
        />
        <VehicleStatusCard />
        <MonthlyStatsCard />

        <div className="mt-4 pt-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">개발 도구</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={() => navigate('home', 'user')}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-violet-600
                       border-2 border-violet-200 bg-violet-50 hover:bg-violet-100
                       active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            고객 모드로 전환 (송하린_데모버전)
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
