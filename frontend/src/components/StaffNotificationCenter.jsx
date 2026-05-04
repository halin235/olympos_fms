/**
 * 직원 알림 센터 — 고밀도 리스트 + 좌측 긴급도 바 (빨강 / 노랑 / 파랑)
 */

import { DEMO_DISPLAY_ANCHOR_DATE_KO } from '../constants/demoTimeline';
import { STAFF_NOTIFICATIONS, STAFF_NOTIFICATION_URGENCY } from '../data/staffNotifications';

const ROW_GRID = 'grid grid-cols-[4px_44px_minmax(0,1fr)_4.5rem] gap-0 items-stretch';

export default function StaffNotificationCenter() {
  return (
    <div className="px-3 pt-2 pb-6 space-y-2 max-w-[430px] mx-auto">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-[10px] text-gray-500">
          {DEMO_DISPLAY_ANCHOR_DATE_KO} · 우선순위 순
        </p>
        <div className="flex items-center gap-2 text-[9px] font-semibold text-gray-500">
          <span className="flex items-center gap-0.5">
            <span className="w-1 h-3 rounded-sm bg-red-500" /> 긴급
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1 h-3 rounded-sm bg-amber-400" /> 검토
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1 h-3 rounded-sm bg-olympos-blue" /> 일반
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div
          className={`${ROW_GRID} px-0 py-1.5 bg-gray-50 border-b border-gray-200 text-[9px] font-bold text-gray-500 uppercase tracking-wide`}
        >
          <span className="sr-only">긴급도</span>
          <span className="pl-0.5">시각</span>
          <span className="pl-1">내용</span>
          <span className="pr-1.5 text-right">차량</span>
        </div>

        <ul className="divide-y divide-gray-100">
          {STAFF_NOTIFICATIONS.map((row) => {
            const u = STAFF_NOTIFICATION_URGENCY[row.urgency];
            return (
              <li key={row.id} className={`${ROW_GRID} ${u.rowTint}`}>
                <div className={`w-full min-h-[3rem] shrink-0 ${u.barClass}`} aria-hidden />
                <div className="flex flex-col justify-center py-2 pl-1 pr-0.5 border-r border-gray-100/60 bg-white/40">
                  <span className="text-[9px] font-mono tabular-nums text-gray-500 leading-none">{row.timeLabel}</span>
                </div>
                <div className="flex flex-col justify-center py-2 pl-2 pr-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 leading-tight">{row.title}</p>
                  <p className="text-[10px] text-gray-600 leading-snug mt-0.5 line-clamp-2">{row.detail}</p>
                  <span className="inline-flex self-start mt-1 rounded px-1 py-px text-[9px] font-bold bg-white/90 border border-gray-200 text-gray-600">
                    {u.label}
                  </span>
                </div>
                <div className="flex flex-col items-end justify-center py-2 pr-1.5 pl-0.5 bg-white/50 border-l border-gray-100/80">
                  <span className="text-[9px] font-mono font-semibold text-gray-800 tabular-nums text-right max-w-[4.25rem] leading-tight break-words">
                    {row.plate}
                  </span>
                  <button
                    type="button"
                    className="mt-1 text-[9px] font-bold text-olympos-blue hover:underline whitespace-nowrap"
                  >
                    처리
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
