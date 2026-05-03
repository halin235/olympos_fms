export default function StatusBadge({ status }) {
  const map = {
    pending:        { label: '정산 대기',   cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    pending_review: { label: '검토 중 🔍', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
    confirmed:      { label: '확정',       cls: 'bg-blue-100   text-olympos-blue border border-blue-200' },
    paid:           { label: '납부 완료',  cls: 'bg-green-100  text-green-700   border border-green-200' },
    disputed:       { label: '분쟁 중',   cls: 'bg-red-100    text-red-700     border border-red-200'   },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
