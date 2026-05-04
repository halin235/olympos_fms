import UserBottomNav from '../components/UserBottomNav';

/**
 * 고객(B2C) 공통 셸 — 하단 탭을 한 번만 마운트하여 전환 시 깜빡임 최소화
 */
export default function UserFlowLayout({ navigate, navActive, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 max-w-[430px] mx-auto">
      {/* 단일 세로 스크롤 — 자식에 overflow-hidden 두지 않음 (본문 잘림 방지) */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
      <UserBottomNav navigate={navigate} active={navActive} />
    </div>
  );
}
