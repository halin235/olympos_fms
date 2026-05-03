import UserBottomNav from '../components/UserBottomNav';

/**
 * 고객(B2C) 공통 셸 — 하단 탭을 한 번만 마운트하여 전환 시 깜빡임 최소화
 */
export default function UserFlowLayout({ navigate, navActive, children }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 max-w-[430px] mx-auto">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">{children}</div>
      <UserBottomNav navigate={navigate} active={navActive} />
    </div>
  );
}
