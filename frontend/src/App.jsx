/**
 * App — 3단계 상태 기반 라우터
 *
 * role: null     → RoleSelectPage  (역할 선택 진입점)
 * role: 'staff'  → 직원용 플로우
 *   page: 'home'     → StaffShellPage      (하단 탭 · 헤더 고정 SPA; 내부 탭: 홈/계약서/알림/마이)
 *   page: 'detail'   → DeploymentDetail    (배차 상세)
 *
 * role: 'user'   → 고객용 플로우
 *   page: 'home'     → UserHomePage       (하단 탭; 알림·마이 등 동일 셸)
 *   page: 'detail'   → UserSettlementPage (정산 상세 — 탭 바 고정)
 *   page: 'contract' → ContractDetailPage (계약서 확인 — 계약서 탭 활성)
 *
 * navigate(page, role?, extra?) — extra.deploymentId 로 직원 배차 상세 연동
 * navigate('role-select') — 역할 선택 화면으로 초기화
 */

import { useState } from 'react';
import './index.css';

import RoleSelectPage      from './pages/RoleSelectPage';
import StaffShellPage      from './pages/StaffShellPage';
import DeploymentDetail    from './pages/DeploymentDetail';
import UserHomePage        from './pages/UserHomePage';
import UserSettlementPage  from './pages/UserSettlementPage';
import ContractDetailPage  from './pages/ContractDetailPage';
import UserFlowLayout       from './layouts/UserFlowLayout';

export default function App() {
  const [role, setRole] = useState(null);     // null | 'staff' | 'user'
  const [page, setPage] = useState('home');       // 라우트 키
  const [staffTab, setStaffTab] = useState('home'); // 직원 셸 내부 탭
  const [userTab, setUserTab] = useState('home'); // 고객 홈 셸 탭 (홈·계약서·알림·마이)
  /** 직원 배차 상세에서 선택된 배차 ID (홈 리스트 → 상세 연동) */
  const [staffDetailDeploymentId, setStaffDetailDeploymentId] = useState(null);

  /**
   * navigate(targetPage, targetRole?, extra?)
   *   - extra.deploymentId: 직원 배차 상세(DeploymentDetail)에 전달할 배차 ID
   */
  const navigate = (targetPage, targetRole, extra) => {
    if (targetPage === 'role-select') {
      setRole(null);
      setPage('home');
      setStaffTab('home');
      setUserTab('home');
      setStaffDetailDeploymentId(null);
      return;
    }

    const effectiveRole = targetRole !== undefined && targetRole !== null ? targetRole : role;
    if (targetRole !== undefined && targetRole !== null) {
      setRole(targetRole);
    }

    const staffShellPages = new Set(['home', 'contract', 'alarm', 'my']);
    if (staffShellPages.has(targetPage) && effectiveRole === 'staff') {
      setStaffDetailDeploymentId(null);
      setStaffTab(targetPage);
      setPage('home');
      return;
    }

    if (effectiveRole === 'staff' && targetPage === 'detail') {
      setStaffDetailDeploymentId(extra?.deploymentId ?? null);
      setPage('detail');
      return;
    }

    if (effectiveRole === 'user') {
      if (targetPage === 'detail') {
        setUserTab('home');
        setPage('detail');
        return;
      }
      const userShellPages = new Set(['home', 'contract', 'alarm', 'my']);
      if (userShellPages.has(targetPage)) {
        setUserTab(targetPage);
        setPage(targetPage === 'contract' ? 'contract' : 'home');
        return;
      }
    }

    setPage(targetPage);
  };

  // ── 역할 선택 전 ──────────────────────────────────────────
  if (!role) {
    return <RoleSelectPage navigate={navigate} />;
  }

  // ── 직원용 (B2B) ──────────────────────────────────────────
  if (role === 'staff') {
    if (page === 'detail') {
      return (
        <DeploymentDetail navigate={navigate} deploymentId={staffDetailDeploymentId} />
      );
    }
    if (page === 'home')   return <StaffShellPage navigate={navigate} staffTab={staffTab} />;
  }

  // ── 고객용 (B2C) — 단일 레이아웃으로 하단 탭 고정(깜빡임 최소화) ──
  if (role === 'user') {
    const userNavActive = page === 'contract' ? 'contract' : page === 'detail' ? 'home' : userTab;
    return (
      <UserFlowLayout navigate={navigate} navActive={userNavActive}>
        {page === 'home' && <UserHomePage navigate={navigate} userTab={userTab} />}
        {page === 'detail' && <UserSettlementPage navigate={navigate} />}
        {page === 'contract' && <ContractDetailPage navigate={navigate} />}
      </UserFlowLayout>
    );
  }

  // fallback
  return <RoleSelectPage navigate={navigate} />;
}
