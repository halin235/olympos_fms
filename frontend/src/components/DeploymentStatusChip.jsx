/**
 * 배차 리스트 — 계약·정산 상태만 표시하는 칩 (운행중 / 반납완료 / 정산대기 …)
 */

import { getDeploymentStatusChipSpec } from '../utils/deploymentListChipSpecs';

const BASE =
  'inline-flex max-w-full shrink-0 items-center rounded-xl border px-2 py-0.5 text-[9px] font-bold tracking-tight leading-snug';

export default function DeploymentStatusChip({ contractStatus, settlementStatus }) {
  const { label, chipClass } = getDeploymentStatusChipSpec(contractStatus, settlementStatus);
  return (
    <span className={`${BASE} ${chipClass}`} title={label}>
      {label}
    </span>
  );
}
