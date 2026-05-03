/**
 * RoleSelectPage — 앱 첫 화면 (역할 선택)
 * /staff → 렌터카 직원용 대시보드
 * /user  → 배차 고객용 화면 (송하린)
 */

export default function RoleSelectPage({ navigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-[430px] mx-auto">
      {/* ── 상단 브랜딩 ── */}
      <div className="relative bg-olympos-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-olympos-blue/70 to-olympos-navy" />

        {/* 배경 원형 장식 */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative px-6 pt-14 pb-12 text-center text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m2-7h3l3 3h-6v-3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight">OLYMPOS</h1>
          <p className="text-blue-200 text-sm mt-1 font-medium">스마트 배차 & 정산 플랫폼</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-blue-100">데모 버전</span>
          </div>
        </div>
      </div>

      {/* ── 역할 선택 카드 영역 ── */}
      <div className="flex-1 px-5 -mt-5 space-y-4 pb-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-5">
          <p className="text-center text-xs text-gray-400 mb-5 font-medium">어떤 모드로 시작하시겠어요?</p>

          {/* 직원용 카드 */}
          <RoleCard
            onClick={() => navigate('home', 'staff')}
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            iconBg="bg-olympos-blue"
            title="렌터카 직원용 모드"
            subtitle="배차·차량·통계 통합 관리"
            tags={['배차현황', '차량현황', '월통계', '정산 확정']}
            primary
          />

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 고객용 카드 */}
          <RoleCard
            onClick={() => navigate('home', 'user')}
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
            title="배차 고객용 모드"
            subtitle="송하린 데모 · 내 배차·정산 확인 및 영수증 첨부"
            tags={['내 정산 금액', '주유 영수증 첨부', '계약서 확인']}
          />
        </div>

        {/* 버전 정보 */}
        <p className="text-center text-xs text-gray-300">
          Olympos Networks FMS v1.0 · 2026 Demo
        </p>
      </div>
    </div>
  );
}

// ── 역할 선택 카드 ───────────────────────────────────────────
function RoleCard({ onClick, icon, iconBg, title, subtitle, tags, primary }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98]
        ${primary
          ? 'bg-olympos-blue hover:bg-olympos-navy shadow-lg shadow-blue-200'
          : 'bg-white border-2 border-gray-100 hover:border-purple-200 hover:shadow-md'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-md`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-bold ${primary ? 'text-white' : 'text-gray-900'}`}>{title}</p>
          <p className={`text-xs mt-0.5 ${primary ? 'text-blue-100' : 'text-gray-500'}`}>{subtitle}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tags.map((tag) => (
              <span key={tag}
                className={`text-xs font-medium px-2 py-0.5 rounded-full
                  ${primary ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <svg className={`w-5 h-5 mt-1 flex-shrink-0 ${primary ? 'text-blue-200' : 'text-gray-300'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
