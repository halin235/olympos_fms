import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// ─────────────────────────────────────────────────────────────
// 이벤트 타입별 메타데이터
// ─────────────────────────────────────────────────────────────
const EVENT_META = {
  enter: {
    label:    'Geofence 진입',
    color:    'bg-olympos-blue text-white',
    ringColor:'ring-blue-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  exit: {
    label:    'Geofence 이탈',
    color:    'bg-gray-400 text-white',
    ringColor:'ring-gray-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
  },
  engine_off: {
    label:    '엔진 OFF',
    color:    'bg-green-500 text-white',
    ringColor:'ring-green-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9 10h.01M15 10h.01M12 12h.01" />
      </svg>
    ),
  },
  engine_on: {
    label:    '엔진 ON',
    color:    'bg-yellow-500 text-white',
    ringColor:'ring-yellow-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────
// 자동 판정 완료 배지
// ─────────────────────────────────────────────────────────────
function AutoJudgeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-olympos-blue px-2.5 py-0.5
                     text-xs font-bold text-white shadow-sm shadow-blue-300">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      자동 판정 완료
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 위경도 좌표 카드 (분쟁 증거용)
// ─────────────────────────────────────────────────────────────
function CoordinateCard({ lat, lng, distanceM, isEstimated }) {
  const hasCoords = lat != null && lat !== 0 && lng != null && lng !== 0;
  if (!hasCoords) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={`mt-2 rounded-xl border px-3 py-2.5 text-xs
      ${isEstimated
        ? 'bg-orange-50 border-orange-200'
        : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-semibold ${isEstimated ? 'text-orange-700' : 'text-olympos-blue'}`}>
          {isEstimated ? '📡 추정 위치 (통신 장애)' : '📍 GPS 확인 좌표'}
        </span>
        {distanceM != null && (
          <span className="text-gray-500">
            거점까지 <strong className="text-gray-700">{distanceM}m</strong>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <code className="font-mono text-gray-700 tracking-tight">
          {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
        </code>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-olympos-blue underline hover:no-underline whitespace-nowrap"
        >
          지도 보기 →
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 타임라인 아이템
// ─────────────────────────────────────────────────────────────
function TimelineItem({ event, isLast }) {
  const meta        = EVENT_META[event.event_type] || {
    label:    event.event_type,
    color:    'bg-gray-300 text-gray-700',
    ringColor:'ring-gray-100',
    icon:     <span>•</span>,
  };
  const ts          = format(new Date(event.occurred_at), 'MM.dd (EEE) HH:mm:ss', { locale: ko });
  const rawPayload  = event.raw_payload;
  const isEstimated = rawPayload?.estimated === true;

  return (
    <div className="flex gap-3">
      {/* 아이콘 + 수직선 */}
      <div className="flex flex-col items-center">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center
                          flex-shrink-0 ring-4 ${meta.color} ${meta.ringColor}`}>
          {meta.icon}
        </span>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" style={{ minHeight: 20 }} />}
      </div>

      {/* 내용 */}
      <div className="pb-5 flex-1 min-w-0">
        {/* 레이블 + 배지 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-800">{meta.label}</span>
          {event.is_return_confirmed && <AutoJudgeBadge />}
          {isEstimated && (
            <span className="badge bg-orange-100 text-orange-700 text-xs border border-orange-200">
              추정값
            </span>
          )}
        </div>

        {/* 타임스탬프 */}
        <p className="text-xs text-gray-500 mt-0.5 font-mono">{ts}</p>

        {/* 위경도 좌표 카드 */}
        <CoordinateCard
          lat={event.latitude}
          lng={event.longitude}
          distanceM={event.distance_from_depot_m}
          isEstimated={isEstimated}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 시간 차이 바 (계약종료 → 반납확정)
// ─────────────────────────────────────────────────────────────
function ReturnDiffBar({ scheduledEndAt, confirmedReturnAt, isEstimated }) {
  const fmtTs = (d) => format(new Date(d), 'MM.dd HH:mm', { locale: ko });

  const diffMs  = new Date(confirmedReturnAt) - new Date(scheduledEndAt);
  const diffMin = Math.floor(diffMs / 60000);
  const isLate  = diffMin > 0;

  return (
    <div className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2.5 mb-4
      ${isEstimated
        ? 'bg-orange-50 border border-orange-200'
        : isLate
          ? 'bg-red-50 border border-red-100'
          : 'bg-green-50 border border-green-100'}`}>
      <div className="flex flex-col items-start">
        <span className="text-gray-400 text-[10px]">계약 종료</span>
        <span className="font-mono font-bold text-gray-700">{fmtTs(scheduledEndAt)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center gap-0.5">
        <span className={`text-[10px] font-semibold
          ${isEstimated ? 'text-orange-500' : isLate ? 'text-red-500' : 'text-green-600'}`}>
          {isEstimated && '추정 · '}
          {isLate ? `+${diffMin}분 연체` : '정시 반납'}
        </span>
        <div className="w-full border-t border-dashed border-gray-300" />
      </div>

      <div className="flex flex-col items-end">
        <span className="text-gray-400 text-[10px]">
          {isEstimated ? '추정 반납' : '반납 확정'}
        </span>
        <span className={`font-mono font-bold
          ${isEstimated ? 'text-orange-600' : isLate ? 'text-red-600' : 'text-green-700'}`}>
          {fmtTs(confirmedReturnAt)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────
export default function GeofenceTimeline({
  events,
  scheduledEndAt,
  confirmedReturnAt,
  isEstimated = false,
}) {
  if (!events || events.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <SectionTitle>지오펜스 이벤트 타임라인</SectionTitle>
        <p className="text-sm text-gray-400 text-center py-6">이벤트 데이터 없음</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle>지오펜스 이벤트 타임라인</SectionTitle>
        {isEstimated && (
          <span className="badge bg-orange-100 text-orange-700 border border-orange-200 text-xs">
            GPS 추정
          </span>
        )}
      </div>

      {/* 시간 차이 바 */}
      {scheduledEndAt && confirmedReturnAt && (
        <ReturnDiffBar
          scheduledEndAt={scheduledEndAt}
          confirmedReturnAt={confirmedReturnAt}
          isEstimated={isEstimated}
        />
      )}

      {/* 이벤트 목록 */}
      <div>
        {events.map((ev, i) => (
          <TimelineItem
            key={ev.id || i}
            event={ev}
            isLast={i === events.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
      <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
      {children}
    </h3>
  );
}
