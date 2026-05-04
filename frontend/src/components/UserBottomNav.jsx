/**
 * 고객(B2C) 모드 하단 탭 — 직원 탭과 동일한 블루 톤·두께감
 * @param {'home'|'contract'|'alarm'|'my'} active
 */
export default function UserBottomNav({ navigate, active = 'home' }) {
  const tabs = [
    { id: 'home', label: '홈', svgD: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    {
      id: 'contract',
      label: '계약서',
      svgD: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      id: 'alarm',
      label: '알림',
      svgD:
        'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
    { id: 'my', label: '마이', svgD: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <nav className="z-20 shrink-0 bg-white border-t border-gray-100 flex shadow-[0_-1px_8px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => navigate?.(t.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[11px] transition-colors duration-200 ease-out
              ${isActive ? 'text-olympos-blue font-bold' : 'text-gray-400 font-medium'}
              hover:text-gray-500 cursor-pointer active:opacity-90`}
          >
            <svg
              className={`w-5 h-5 transition-colors duration-200 ease-out ${isActive ? 'text-olympos-blue' : 'text-gray-400'}`}
              fill={isActive && t.id === 'home' ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={isActive && t.id === 'home' ? 0 : isActive ? 2.25 : 1.65}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={t.svgD} />
            </svg>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
