/**
 * 배차·계약 리스트용 반납 지점 + 계약 상태 통합 라벨 (관리자 스캔용)
 */
export function formatBranchStatusChip(contractStatus, branchName) {
  if (!branchName) return '';
  switch (contractStatus) {
    case 'active':
      return `[운행중 | ${branchName} 예정]`;
    case 'returned':
      return `[반납완료 | ${branchName}]`;
    case 'settled':
      return `[정산완료 | ${branchName}]`;
    default:
      return `[${branchName}]`;
  }
}
