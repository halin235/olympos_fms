/** 운행중(active) 배차 — 아직 반납 전임을 강조하는 관리자용 뱃지 */
export default function ActiveNotReturnedBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-700 leading-snug whitespace-nowrap ${className}`}
    >
      미반납
    </span>
  );
}
