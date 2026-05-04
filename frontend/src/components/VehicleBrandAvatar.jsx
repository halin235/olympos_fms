/**
 * 홈 「내 이용 차량」 — 차종별 마크
 * - 스파크: 실사 이미지 public/assets/images/spark_real.png
 * - 그 외: 범용 딜리버리 아이콘 public/assets/icons/car-delivery-icon.png
 * 전기차(테슬라 등)는 범용 아이콘 + 우측 하단 번개 뱃지
 */

const PUBLIC = process.env.PUBLIC_URL ?? '';

const CAR_DELIVERY_ICON = `${PUBLIC}/assets/icons/car-delivery-icon.png`;
const SPARK_REAL_IMAGE = `${PUBLIC}/assets/images/spark_real.png`;

/** 데모/표기 변형 대응: 스파크 전용 실사만 적용 */
export function isSparkVehicleModel(vehicleName) {
  return /스파크/i.test(vehicleName ?? '');
}

function showEvBoltBadge({ vehicleName, powertrain }) {
  const name = vehicleName ?? '';
  return (
    powertrain === 'ev' ||
    /테슬라|모델\s*[3ysx]|아이오닉|EV\b|전기|ionic/i.test(name)
  );
}

function EvBoltBadge({ className = '' }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md shadow-olympos-blue/15 ring-1 ring-blue-100 ${className}`}
      aria-hidden
    >
      <svg className="h-3.5 w-3.5 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 21l1-7H6l9-13h-1l-1 8h7l-9 13z" />
      </svg>
    </span>
  );
}

/**
 * @param {{ vehicleName?: string, powertrain?: 'ice'|'ev', title?: string }} props
 */
export default function VehicleBrandAvatar({ vehicleName, powertrain = 'ice', title }) {
  const isSpark = isSparkVehicleModel(vehicleName);
  const evBadge = !isSpark && showEvBoltBadge({ vehicleName, powertrain });

  const src = isSpark ? SPARK_REAL_IMAGE : CAR_DELIVERY_ICON;
  const innerPad = isSpark ? 'p-1' : 'p-2';
  const imgClass = isSpark
    ? 'h-[52px] w-[52px] max-h-[52px] max-w-[52px] object-contain object-center select-none'
    : 'h-12 w-12 max-h-[48px] max-w-[48px] object-contain object-center select-none';

  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-olympos-blue-lt via-[#E8EFFC] to-[#DCE8FA] shadow-[0_10px_28px_-8px_rgba(27,79,191,0.22)] ring-1 ring-white/90 ring-inset border border-blue-100/80 overflow-hidden"
      title={title}
    >
      <span
        className="pointer-events-none absolute inset-px rounded-[0.9rem] bg-gradient-to-b from-white/55 to-transparent opacity-90 z-[1]"
        aria-hidden
      />
      <div className={`relative z-[2] flex h-full w-full items-center justify-center ${innerPad}`}>
        <img
          src={src}
          alt=""
          width={isSpark ? 52 : 48}
          height={isSpark ? 52 : 48}
          decoding="async"
          draggable={false}
          className={imgClass}
        />
      </div>
      {evBadge ? <EvBoltBadge /> : null}
    </div>
  );
}
