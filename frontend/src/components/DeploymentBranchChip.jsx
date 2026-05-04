/**
 * 배차 리스트 — 반납 거점만 표시하는 칩 (지점명 · active 시 「예정」 접미사)
 */

import { getDeploymentBranchChipLabel } from '../utils/deploymentListChipSpecs';

const BASE =
  'inline-flex max-w-full min-w-0 items-center rounded-xl border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-bold text-gray-800 tracking-tight leading-snug break-words';

export default function DeploymentBranchChip({ contractStatus, branchName }) {
  const label = getDeploymentBranchChipLabel(contractStatus, branchName);
  if (!label) return null;
  return (
    <span className={BASE} title={label}>
      {label}
    </span>
  );
}
