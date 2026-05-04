/**
 * UserHomePage — B2C 배차 고객용 홈 (송하린_데모버전)
 *
 * Task 1: 인사 배너 하단에 현재 상태 요약 메시지 추가
 * Task 2: 정산 카드 슬림 다운 — 연료 세부 수치 제거, 총액만 강조
 * Task 3: 용어 언어화 — '보험대차 · 1일' → '보험대차 (1일 이용)'
 */
import {
  DEMO_DISPLAY_ANCHOR_DATE_KO,
} from '../constants/demoTimeline';
import { DEMO_USER_RENTAL } from '../constants/demoUserRental';
import UserNotificationCenter from '../components/UserNotificationCenter';
import VehicleBrandAvatar from '../components/VehicleBrandAvatar';

const MOCK_RENTAL = DEMO_USER_RENTAL;

// 데모용 요약 상태 데이터 (상단 카드 · 정산 카드 공통)
const SUMMARY = {
  pendingCount: 1,
  totalAmount:  7130,
};

export default function UserHomePage({ navigate, userTab = 'home' }) {
  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      {/* ── 상단 헤더 ── */}
      <header className="shrink-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-olympos-blue flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10" />
            </svg>
          </div>
          <span className="text-base font-black text-olympos-navy tracking-tight">OLYMPOS</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('role-select')}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            모드 전환
          </button>

          <button className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
        </div>
      </header>

      <main className="flex flex-col">
        {userTab === 'home' && (
          <>
        {/* ── 인사 배너 + 본문 카드 — gap으로 겹침 방지 (-mt 오버랩 제거) ── */}
        <div className="flex flex-col gap-4">
        <section className="relative z-0 shrink-0 bg-olympos-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-olympos-blue/60 to-olympos-navy pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" aria-hidden />
          <div className="relative px-5 pt-6 pb-7 text-white">
            <p className="text-sm text-blue-200 font-medium">안녕하세요,</p>
            <h2 className="text-xl font-black mt-0.5">
              {MOCK_RENTAL.customerName} 님 <span className="font-normal">👋</span>
            </h2>
            <p className="text-xs text-blue-200 mt-1.5">올림포스를 이용해 주셔서 감사합니다</p>
          </div>
        </section>

        <div className="relative z-[1] px-4 space-y-3 pb-6 isolate">

          {/* ── Task 1: 상태 요약 메시지 카드 ── */}
          <StatusSummaryCard
            name={MOCK_RENTAL.customerName}
            pendingCount={SUMMARY.pendingCount}
            totalAmount={SUMMARY.totalAmount}
            onDetailClick={() => navigate('detail')}
          />

          {/* ── 현재 이용 차량 카드 ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-olympos-blue to-blue-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">내 이용 차량</h3>
                <span className="badge bg-yellow-100 text-yellow-700 border border-yellow-200">반납 완료</span>
              </div>

              <div className="flex items-center gap-4">
                <VehicleBrandAvatar
                  vehicleName={MOCK_RENTAL.vehicle}
                  powertrain={MOCK_RENTAL.powertrain ?? 'ice'}
                  title={`${MOCK_RENTAL.vehicle} (${MOCK_RENTAL.plate})`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                    {MOCK_RENTAL.vehicle}
                  </p>
                  <p
                    className="mt-1 text-[13px] font-semibold text-gray-700 tabular-nums tracking-wide whitespace-nowrap overflow-hidden text-ellipsis font-mono"
                    title={MOCK_RENTAL.plate}
                  >
                    {MOCK_RENTAL.plate}
                  </p>
                  {/* Task 3: 언어화 — '보험대차 · 1일' → '보험대차 (1일 이용)' */}
                  <span className="mt-1 inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-medium">
                    {MOCK_RENTAL.contractType} ({MOCK_RENTAL.days}일 이용)
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <DateBox label="대여 시작일" value={MOCK_RENTAL.startDate} />
                <DateBox label="반납 일시" value={MOCK_RENTAL.endDate} accent />
              </div>
              {MOCK_RENTAL.status === 'returned' && (
                <p className="mt-3 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  지정된 지점에 정상적으로 반납 처리가 완료되었습니다.
                </p>
              )}
            </div>
          </div>

          {/* ── Task 2: 정산 안내 카드 (슬림 다운) ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
              <h3 className="text-sm font-bold text-gray-900">내 정산 금액</h3>
              <span className="ml-auto badge bg-yellow-50 text-olympos-blue border border-yellow-300 text-[11px] font-bold shadow-sm">
                확인 필요
              </span>
            </div>

            {/* 총액 강조 — 세부 내역 수치 제거 */}
            <div className="bg-gradient-to-br from-olympos-blue to-olympos-navy rounded-2xl p-5 text-white mb-4 shadow-inner shadow-black/10">
              <p className="text-xs text-blue-200 mb-1.5">반납 후 최종 정산 금액</p>
              <p className="text-5xl sm:text-[2.75rem] font-black tracking-tight tabular-nums leading-none drop-shadow-sm">
                {SUMMARY.totalAmount.toLocaleString('ko-KR')}
                <span className="text-2xl font-bold ml-1 align-baseline">원</span>
              </p>
              <p className="text-xs text-blue-100/95 mt-3 leading-relaxed font-medium">
                위 금액은 {DEMO_DISPLAY_ANCHOR_DATE_KO} 반납 기준으로 산출된 예상 합계입니다. 상단 안내와 동일합니다.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('detail')}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-olympos-blue
                           hover:bg-olympos-navy transition-colors shadow-md shadow-blue-200 active:scale-[0.98]"
              >
                정산 상세 확인 →
              </button>
              <button
                onClick={() => navigate('detail')}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold text-olympos-blue
                           border-2 border-olympos-blue hover:bg-olympos-blue-lt transition-colors"
              >
                📎 주유 영수증 첨부하기
              </button>
            </div>
          </div>

          {/* ── 계약서 확인 카드 ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">계약서 확인</p>
                  {/* Task 3: 언어화 */}
                  <p className="text-xs text-gray-400">보험대차 (1일 이용)</p>
                </div>
              </div>
              <button
                onClick={() => navigate('contract')}
                className="text-xs font-semibold text-olympos-blue border border-olympos-blue rounded-xl px-3 py-1.5 hover:bg-olympos-blue-lt transition-colors active:scale-[0.97]"
              >
                보기
              </button>
            </div>
          </div>

          {/* ── 안내 배너 ── */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-olympos-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-bold text-olympos-blue mb-0.5">정산 금액이 다른 것 같다면?</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                주유 영수증을 첨부하시면 운영자가 직접 재검토해 드립니다.
                영수증 접수 즉시 자동 결제가 중단됩니다.
              </p>
            </div>
          </div>
        </div>
        </div>
          </>
        )}

        {userTab === 'alarm' && <UserNotificationCenter />}
        {userTab === 'my' && <UserMyTabPlaceholder />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 마이 탭 (플레이스홀더)
// ─────────────────────────────────────────────────────────────
function UserMyTabPlaceholder() {
  return (
    <div className="px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-olympos-blue to-olympos-navy flex items-center justify-center text-white text-lg font-black">
            송
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">송하린 님</p>
            <p className="text-xs text-gray-400 mt-0.5">OLYMPOS 고객 · 데모 계정</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          예약 내역·결제·알림 설정은 향후 이 탭에서 제공될 예정입니다.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Task 1: 상태 요약 메시지 카드
// ─────────────────────────────────────────────────────────────
function StatusSummaryCard({ name, pendingCount, totalAmount, onDetailClick }) {
  const amt = Number(totalAmount).toLocaleString('ko-KR');
  return (
    <div className="relative z-[1] bg-white rounded-2xl shadow-md shadow-blue-50 border border-blue-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-olympos-blue via-blue-400 to-blue-300" />
      <div className="px-4 py-4 flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-10 h-10 rounded-xl bg-olympos-blue-lt flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
          <svg className="w-5 h-5 text-olympos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        {/* 메시지 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug">
            {name} 님, 반납이 완료되었습니다.
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            확인이 필요한 정산 내역이{' '}
            <span className="font-bold text-olympos-blue">{pendingCount}건</span>
            {' '}있습니다. 예상 합계{' '}
            <span className="font-black text-gray-900 tabular-nums">{amt}원</span>
            은 아래 「내 정산 금액」과 동일합니다.
          </p>
        </div>

        {/* 알림 뱃지 + 이동 버튼 */}
        <button
          onClick={onDetailClick}
          className="flex-shrink-0 flex items-center gap-1 bg-olympos-blue text-white text-xs font-bold rounded-xl px-3 py-1.5 hover:bg-olympos-navy active:scale-[0.97] transition-all shadow-sm shadow-blue-200"
        >
          확인
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── 서브 컴포넌트 ────────────────────────────────────────────
function DateBox({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-3 ${accent ? 'bg-olympos-blue-lt border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xs font-semibold ${accent ? 'text-olympos-blue' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
