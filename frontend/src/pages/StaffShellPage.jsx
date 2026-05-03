import StaffBottomNav from '../components/StaffBottomNav';
import StaffContractCenter from '../components/StaffContractCenter';
import { StaffDashboardTabContent } from './HomePage';

const TAB_TITLES = {
  home: '배차 관리 대시보드',
  contract: '계약 관리 센터',
  alarm: '알림 센터',
  my: '내 정보',
};

function StaffAlarmTabPlaceholder() {
  return (
    <div className="px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-olympos-blue-lt flex items-center justify-center mb-3 border border-blue-100">
          <svg className="w-6 h-6 text-olympos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-900 mb-1">받은 알림이 없습니다</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          배차·계약·정산 알림이 도착하면 이곳에서 한눈에 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

function StaffMyTabPlaceholder() {
  return (
    <div className="px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-olympos-blue to-olympos-navy flex items-center justify-center text-white text-lg font-black">
            하
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">송하린</p>
            <p className="text-xs text-gray-400 mt-0.5">올림포스 운영 · 직원 계정</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          프로필·권한·알림 설정은 향후 연동 예정입니다.
        </p>
      </div>
    </div>
  );
}

/**
 * 직원 메인 셸 — 상단 헤더·하단 탭 고정, 본문만 탭별 교체 (SPA 느낌)
 */
export default function StaffShellPage({ navigate, staffTab }) {
  const title = TAB_TITLES[staffTab] ?? TAB_TITLES.home;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-[430px] mx-auto">
      <header className="sticky top-0 z-20 shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="relative flex items-center justify-between px-3 py-3 gap-2 min-h-[52px]">
          <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 z-10">
            <div className="w-7 h-7 rounded-lg bg-olympos-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-extrabold tracking-tight">OL</span>
            </div>
            <span className="text-xs font-extrabold text-olympos-blue tracking-wide truncate">
              OLYMPOS
            </span>
          </div>

          <div className="absolute left-0 right-0 flex justify-center pointer-events-none px-16 sm:px-20">
            <h1
              key={staffTab}
              className="text-[15px] font-bold text-gray-900 tracking-tight text-center truncate max-w-[min(240px,72vw)] olympos-header-title-fade"
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 z-10">
            <span className="text-[10px] font-bold text-olympos-blue bg-olympos-blue-lt border border-blue-200 rounded-full px-2 py-0.5 whitespace-nowrap">
              직원용
            </span>
            <button
              type="button"
              onClick={() => navigate?.('alarm')}
              className="relative w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
              aria-label="알림"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <button
              type="button"
              onClick={() => navigate?.('role-select')}
              className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors border border-gray-200 rounded-lg px-2 py-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              전환
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
        <div key={staffTab} className="olympos-tab-panel-enter pb-1">
          {staffTab === 'home' && <StaffDashboardTabContent navigate={navigate} />}
          {staffTab === 'contract' && (
            <div className="px-3 pt-3 pb-4 space-y-3">
              <StaffContractCenter />
            </div>
          )}
          {staffTab === 'alarm' && <StaffAlarmTabPlaceholder />}
          {staffTab === 'my' && <StaffMyTabPlaceholder />}
        </div>
      </main>

      <StaffBottomNav navigate={navigate} active={staffTab} />
    </div>
  );
}
