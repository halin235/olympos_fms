/**
 * 배차 리스트 — 상태 칩 / 지점 칩 분리용 스펙 (Single Source of Truth)
 */

/**
 * @param {string|null|undefined} settlementStatus
 * @returns {{ label: string, chipClass: string }}
 */
export function getDeploymentStatusChipSpec(contractStatus, settlementStatus) {
  if (contractStatus === 'active') {
    return {
      label: '운행중',
      chipClass: 'border-blue-200 bg-blue-50 text-olympos-blue',
    };
  }
  if (contractStatus === 'returned') {
    const pending =
      settlementStatus === 'pending' || settlementStatus === 'pending_review';
    if (pending) {
      return {
        label: '정산대기',
        chipClass: 'border-amber-200 bg-amber-50 text-amber-900',
      };
    }
    return {
      label: '반납완료',
      chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    };
  }
  if (contractStatus === 'settled') {
    return {
      label: '정산완료',
      chipClass: 'border-slate-200 bg-slate-100 text-slate-800',
    };
  }
  return {
    label: contractStatus ? String(contractStatus) : '상태 미상',
    chipClass: 'border-gray-200 bg-gray-50 text-gray-700',
  };
}

/**
 * @returns {string|null} 표시할 지점 라벨 없으면 null
 */
export function getDeploymentBranchChipLabel(contractStatus, branchName) {
  if (!branchName) return null;
  if (contractStatus === 'active') return `${branchName} 예정`;
  return branchName;
}
