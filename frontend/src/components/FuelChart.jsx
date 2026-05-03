/**
 * FuelChart — 연료 변화 그래프
 *
 * Task 1: 용어 변경
 *   "OBD 원시값"  → "실시간 측정값"
 *   "MAF 스무딩값" → "정밀 보정값"
 *   "MAF 보정값"  → "정밀 보정값"  (통일)
 *
 * Task 2: 범례 아이템 옆 ? 아이콘 + hover/click 툴팁
 * Task 3: 툴팁 박스는 그래프 아래 범례 영역에서 위로 팝업
 */

import { useState } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const BLUE    = '#1B4FBF';
const BLUE_LT = '#EEF3FD';
const GRAY    = '#9CA3AF';
const GREEN   = '#10B981';
const ORANGE  = '#F59E0B';

// ─────────────────────────────────────────────────────────────
// Task 2 & 3: 범례 툴팁 컴포넌트
// hover + click 모두 지원 (모바일 대응)
// ─────────────────────────────────────────────────────────────
function LegendTooltip({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        aria-label="설명 보기"
        className="w-4 h-4 rounded-full bg-olympos-blue-lt border border-blue-200
                   text-olympos-blue text-[9px] font-black flex items-center justify-center
                   hover:bg-olympos-blue hover:text-white hover:border-olympos-blue
                   transition-colors cursor-pointer flex-shrink-0"
      >
        ?
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
                     w-52 bg-olympos-navy text-white text-[11px] leading-relaxed
                     rounded-xl px-3 py-2.5 shadow-xl shadow-blue-900/20
                     pointer-events-none"
        >
          {text}
          {/* 꼬리 삼각형 */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2
                       w-0 h-0 border-l-4 border-r-4 border-t-4
                       border-l-transparent border-r-transparent border-t-olympos-navy"
          />
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 커스텀 차트 호버 툴팁 (Task 1: 레이블 적용)
// ─────────────────────────────────────────────────────────────
const NAME_MAP = {
  raw:      '실시간 측정값',
  smoothed: '정밀 보정값',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs min-w-[148px]">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: p.color }} />
            {NAME_MAP[p.dataKey] ?? p.name}
          </span>
          <span className="font-bold tabular-nums">{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 반납 확정 점 (정밀 보정값 라인 위 초록 원)
// ─────────────────────────────────────────────────────────────
function ReturnDot(props) {
  const { cx, cy, payload } = props;
  if (!payload?.isReturn) return null;
  return (
    <g key={`return-dot-${cx}`}>
      <circle cx={cx} cy={cy} r={8} fill={GREEN} opacity={0.2} />
      <circle cx={cx} cy={cy} r={5} fill={GREEN} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// 통신 장애 배지
// ─────────────────────────────────────────────────────────────
function GapWarningBadge({ gapMinutes }) {
  return (
    <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5">
      <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-semibold text-orange-700">통신 장애 {gapMinutes}분 구간</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────
export default function FuelChart({ readings, handoverFuelPct, isEstimated, gapMinutes }) {
  if (!readings || readings.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <SectionTitle>연료 변화 그래프</SectionTitle>
        <p className="text-sm text-gray-400 text-center py-10">연료 측정 데이터 없음</p>
      </section>
    );
  }

  // 차트 데이터 가공
  const data = readings.map((r, i) => ({
    time:     format(new Date(r.measured_at), 'HH:mm', { locale: ko }),
    raw:      parseFloat(r.raw_fuel_pct),
    smoothed: r.smoothed_fuel_pct != null ? parseFloat(r.smoothed_fuel_pct) : undefined,
    isReturn: r.is_return_reading,
    isGap:    r.is_gap_estimated,
    index:    i,
  }));

  // 통신 장애 구간
  const gapRanges = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].isGap) gapRanges.push({ x1: data[i - 1].time, x2: data[i].time });
  }

  const returnReading = readings.find((r) => r.is_return_reading);
  const returnPct     = returnReading
    ? parseFloat(returnReading.smoothed_fuel_pct ?? returnReading.raw_fuel_pct)
    : null;

  const diffPct   = handoverFuelPct != null && returnPct != null ? handoverFuelPct - returnPct : null;
  const isDeficit = diffPct != null && diffPct > 0;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between">
        <SectionTitle>연료 변화 그래프</SectionTitle>
        {isEstimated && gapMinutes > 0 && <GapWarningBadge gapMinutes={gapMinutes} />}
      </div>

      {/* ── 인수 → 반납 요약 칩 ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <FuelChip color={BLUE} label="인수" value={`${handoverFuelPct}%`} />
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {returnPct != null && (
          <FuelChip
            color={isDeficit ? '#EF4444' : GREEN}
            label="반납 (정밀 보정)"
            value={`${returnPct}%`}
            sub={diffPct != null ? `${isDeficit ? '▼' : '▲'} ${Math.abs(diffPct).toFixed(1)}%` : null}
            subColor={isDeficit ? '#EF4444' : GREEN}
          />
        )}
        <span className="ml-auto text-xs text-gray-400 bg-gray-50 rounded-full px-2.5 py-1">
          데이터 분석 기준
        </span>
      </div>

      {/* ── 추정치 안내 배너 ── */}
      {isEstimated && (
        <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
          <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-orange-700 leading-relaxed">
            <strong>통신 장애로 인한 추정치</strong> — 점선 구간은 센서 데이터 미수신 구간이며,
            마지막 수신 데이터를 기준으로 연료량이 산출되었습니다.
          </p>
        </div>
      )}

      {/* ── Recharts 그래프 ── */}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={BLUE}   stopOpacity={0.12} />
              <stop offset="95%" stopColor={BLUE}   stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={ORANGE} stopOpacity={0.08} />
              <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: GRAY }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[
              (min) => Math.max(0,   Math.floor(min  - 5)),
              (max) => Math.min(100, Math.ceil(max + 5)),
            ]}
            unit="%" tick={{ fontSize: 10, fill: GRAY }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />

          {/* 통신 장애 구간 하이라이트 */}
          {gapRanges.map((g, i) => (
            <ReferenceArea
              key={i} x1={g.x1} x2={g.x2}
              fill="url(#gapGrad)" stroke={ORANGE}
              strokeOpacity={0.3} strokeDasharray="3 2"
              label={{ value: '장애 구간', position: 'insideTop', fontSize: 9, fill: ORANGE }}
            />
          ))}

          {/* 인수 연료 기준선 */}
          {handoverFuelPct != null && (
            <ReferenceLine
              y={handoverFuelPct} stroke={BLUE}
              strokeDasharray="4 2" strokeWidth={1.5}
              label={{ value: `인수 ${handoverFuelPct}%`, position: 'insideTopRight', fontSize: 10, fill: BLUE }}
            />
          )}

          {/* 반납 연료 기준선 */}
          {returnPct != null && (
            <ReferenceLine
              y={returnPct} stroke={GREEN}
              strokeDasharray="4 2" strokeWidth={1.5}
              label={{ value: `반납 ${returnPct}%`, position: 'insideBottomRight', fontSize: 10, fill: GREEN }}
            />
          )}

          {/* 실시간 측정값 — 점선 (Task 1) */}
          <Line
            type="monotone"
            dataKey="raw"
            name="실시간 측정값"
            stroke={GRAY}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 3, fill: GRAY }}
          />

          {/* 정밀 보정값 — 실선 + 면적 (Task 1) */}
          <Area
            type="monotone"
            dataKey="smoothed"
            name="정밀 보정값"
            stroke={BLUE}
            strokeWidth={2.5}
            fill="url(#blueGrad)"
            dot={<ReturnDot />}
            activeDot={{ r: 4, fill: BLUE, stroke: '#fff', strokeWidth: 2 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Task 2 & 3: 커스텀 범례 (툴팁 포함) ── */}
      <div className="flex items-center justify-center gap-5 text-xs text-gray-500 flex-wrap">

        {/* 실시간 측정값 */}
        <span className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-gray-400 inline-block flex-shrink-0" />
          <span className="font-medium">실시간 측정값</span>
          <LegendTooltip text="차량 센서에서 실시간으로 읽어온 연료 데이터입니다." />
        </span>

        {/* 정밀 보정값 */}
        <span className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-blue-600 inline-block flex-shrink-0" />
          <span className="font-medium">정밀 보정값</span>
          <LegendTooltip text="데이터 오차를 보정하여 실제 잔여량에 가장 가깝게 분석한 결과입니다." />
        </span>

        {/* 반납 확정 시점 */}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
          <span className="font-medium">반납 확정</span>
        </span>

        {/* 통신 장애 구간 (추정치인 경우에만) */}
        {isEstimated && (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-orange-100 border border-orange-300 inline-block flex-shrink-0" />
            <span className="font-medium">장애 구간</span>
          </span>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 헬퍼 컴포넌트
// ─────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
      <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
      {children}
    </h3>
  );
}

function FuelChip({ color, label, value, sub, subColor }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
      <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-bold text-gray-800">{value}</span>
      {sub && (
        <span className="text-xs font-semibold" style={{ color: subColor }}>{sub}</span>
      )}
    </div>
  );
}
