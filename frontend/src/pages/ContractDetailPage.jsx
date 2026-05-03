/**
 * ContractDetailPage — 계약서 상세 (플레이스홀더)
 *
 * 경로: /contract/detail (state-based: page === 'contract')
 * 다음 단계에서 계약서 PDF 뷰어 또는 상세 정보 UI로 교체 예정.
 *
 * 현재 구현:
 *   - 계약 기본 정보 (차량, 기간, 금액)
 *   - "상세 화면 구현 예정" 안내 배너
 *   - 뒤로 가기 (홈 탭 복귀)
 */

const MOCK_CONTRACT = {
  contractNo:   'R220511630002',
  type:         '보험대차',
  vehicle:      '스파크',
  plate:        '서울1호12354',
  customer:     '송하린_데모버전',
  startDate:    '2022년 5월 11일 10:18',
  endDate:      '2022년 5월 12일 10:18',
  days:         1,
  dailyRate:    50000,
  deposit:      100000,
  insuranceCo:  '현대해상',
  claimNo:      'HA-2022-05112345',
};

export default function ContractDetailPage({ navigate }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 shrink-0 bg-white border-b border-gray-100 flex items-center px-4 py-3 gap-3 shadow-sm">
        <button
          onClick={() => navigate('home')}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900">계약서 확인</h1>
        <div className="w-8" />
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        {/* 히어로 배너 */}
        <div className="bg-olympos-navy relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-olympos-blue/60 to-olympos-navy" />
          <div className="relative px-5 pt-5 pb-8 text-white">
            <p className="text-xs text-blue-200">{MOCK_CONTRACT.customer} 님의</p>
            <p className="text-sm font-bold mt-0.5">{MOCK_CONTRACT.type} 계약서</p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-semibold">{MOCK_CONTRACT.contractNo}</span>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-3 pb-6">
          {/* 준비 중 안내 배너 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">계약서 상세 화면 준비 중</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                계약서 PDF 뷰어 및 서명 기능이 다음 업데이트에서 제공될 예정입니다.
                현재는 계약 기본 정보를 미리 확인하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 계약 기본 정보 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-olympos-blue to-blue-400" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
                <h3 className="text-sm font-bold text-gray-900">계약 기본 정보</h3>
              </div>

              <div className="space-y-2.5">
                <ContractRow label="계약 유형"  value={MOCK_CONTRACT.type} />
                <ContractRow label="계약 번호"  value={MOCK_CONTRACT.contractNo} />
                <ContractRow label="차량"       value={`${MOCK_CONTRACT.vehicle} (${MOCK_CONTRACT.plate})`} />
                <ContractRow label="대여자"     value={MOCK_CONTRACT.customer} />
                <div className="h-px bg-gray-100" />
                <ContractRow label="대여 시작"  value={MOCK_CONTRACT.startDate} />
                <ContractRow label="반납 예정"  value={MOCK_CONTRACT.endDate} accent />
                <ContractRow label="대여 기간"  value={`${MOCK_CONTRACT.days}일`} />
              </div>
            </div>
          </div>

          {/* 보험 정보 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-green-500 inline-block" />
              <h3 className="text-sm font-bold text-gray-900">보험 정보</h3>
            </div>
            <div className="space-y-2.5">
              <ContractRow label="보험사"   value={MOCK_CONTRACT.insuranceCo} />
              <ContractRow label="접수 번호" value={MOCK_CONTRACT.claimNo} />
            </div>
          </div>

          {/* 요금 정보 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
              <h3 className="text-sm font-bold text-gray-900">요금 정보</h3>
            </div>
            <div className="space-y-2.5">
              <ContractRow
                label="일일 요금"
                value={`${MOCK_CONTRACT.dailyRate.toLocaleString('ko-KR')}원`}
              />
              <ContractRow
                label="보증금"
                value={`${MOCK_CONTRACT.deposit.toLocaleString('ko-KR')}원`}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <p className="text-xs text-blue-600 leading-relaxed">
                * 보험대차의 경우 실제 결제 금액은 보험사 처리 후 확정됩니다.
                정산 내역은 '내 정산 내역' 화면에서 확인하세요.
              </p>
            </div>
          </div>

          {/* 정산 바로가기 */}
          <button
            onClick={() => navigate('detail')}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-olympos-blue
                       hover:bg-olympos-navy shadow-md shadow-blue-200 active:scale-[0.98] transition-all"
          >
            내 정산 내역 확인 →
          </button>
        </div>
      </main>
    </div>
  );
}

// ── 서브 컴포넌트 ──────────────────────────────────────────
function ContractRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${accent ? 'text-olympos-blue' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}
