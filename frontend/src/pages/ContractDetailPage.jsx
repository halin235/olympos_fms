/**
 * ContractDetailPage — 보험대차 전자 계약서 확인·서명·보험사 전달 (데모)
 */

import { useCallback, useState } from 'react';
import {
  DEMO_CONTRACT_NUMBER,
  DEMO_CLAIM_NO,
  DEMO_CONTRACT_START_KO,
  DEMO_CONTRACT_END_KO,
  DEMO_PERIOD_MONTH_KO,
} from '../constants/demoTimeline';
import { DEMO_PLATE_SPARK } from '../constants/demoVehiclePlates';
import ContractSignatureModal from '../components/ContractSignatureModal';
import { downloadInsuranceContractPdf } from '../utils/contractPdfDownload';

const MOCK_CONTRACT = {
  contractNo:   DEMO_CONTRACT_NUMBER,
  type:         '보험대차',
  vehicle:      '스파크',
  plate:        DEMO_PLATE_SPARK,
  /** 화면·계약 본문 표기용 실명 */
  lesseeName:   '송하린',
  startDate:    DEMO_CONTRACT_START_KO,
  endDate:      DEMO_CONTRACT_END_KO,
  days:         1,
  dailyRate:    50000,
  deposit:      100000,
  insuranceCo:  '현대해상',
  claimNo:      DEMO_CLAIM_NO,
};

export default function ContractDetailPage({ navigate }) {
  const [sigOpen, setSigOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const hasSigned = !!signatureDataUrl;
  const canSubmit = agreed && hasSigned && !submitting;

  const handlePdfDownload = useCallback(async () => {
    setPdfBusy(true);
    try {
      await downloadInsuranceContractPdf({
        contractNo: MOCK_CONTRACT.contractNo,
        lesseeName: MOCK_CONTRACT.lesseeName,
        vehicle: MOCK_CONTRACT.vehicle,
        plate: MOCK_CONTRACT.plate,
        startDate: MOCK_CONTRACT.startDate,
        endDate: MOCK_CONTRACT.endDate,
        days: MOCK_CONTRACT.days,
        insuranceCo: MOCK_CONTRACT.insuranceCo,
        claimNo: MOCK_CONTRACT.claimNo,
        dailyRate: MOCK_CONTRACT.dailyRate,
        deposit: MOCK_CONTRACT.deposit,
      });
    } catch (e) {
      console.error(e);
      setToast({ message: 'PDF 생성에 실패했습니다. 다시 시도해 주세요.', tone: 'error' });
      setTimeout(() => setToast(null), 3200);
    } finally {
      setPdfBusy(false);
    }
  }, []);

  const handleInsuranceSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSubmitting(false);
    setToast({ message: '전송 완료', tone: 'success' });
    setTimeout(() => setToast(null), 3400);
  }, [canSubmit]);

  return (
    <div className="flex min-h-full flex-col bg-[#F5F6F8]">
      <header className="sticky top-0 z-20 shrink-0 bg-white border-b border-gray-200 flex items-center px-4 py-3 gap-3 shadow-sm">
        <button
          type="button"
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

      <div className="flex flex-col pb-2">
        <main className="flex flex-col">
          {/* 미니 히어로 */}
          <div className="relative overflow-hidden bg-olympos-navy">
            <div className="absolute inset-0 opacity-90 bg-gradient-to-br from-olympos-blue to-olympos-navy" />
            <div className="relative px-5 pt-4 pb-4 text-white">
              <p className="text-xs text-blue-100/90 font-medium">{MOCK_CONTRACT.lesseeName} 님의</p>
              <p className="text-sm font-bold mt-0.5 tracking-tight">{MOCK_CONTRACT.type} 계약서</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/12 rounded-full px-3 py-1 border border-white/15">
                <svg className="w-3 h-3 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-semibold tracking-wide">{MOCK_CONTRACT.contractNo}</span>
              </div>
            </div>
          </div>

          <div className="px-4 -mt-3 space-y-2 pt-0.5">
            {/* 계약서 뷰어 카드 */}
            <section className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-olympos-blue to-blue-400" />
              <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100 bg-gray-50/80">
                <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
                <h2 className="text-sm font-bold text-gray-900">계약서 뷰어</h2>
                <span className="ml-auto text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Official copy
                </span>
              </div>

              {/* 스크롤 가능 전문 */}
              <div
                className="max-h-[min(46vh,400px)] overflow-y-auto overscroll-y-contain px-4 py-3 space-y-4 text-[13px] leading-relaxed text-gray-800"
                style={{ fontFamily: 'Pretendard, "Noto Sans KR", sans-serif' }}
              >
                <header className="text-center border-b border-gray-100 pb-4">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    보험대차 자동차 임대차 계약서
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    전자계약 · 데모 · {DEMO_PERIOD_MONTH_KO} 기준
                  </p>
                </header>

                <dl className="grid grid-cols-1 gap-y-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400 shrink-0">계약번호</dt>
                    <dd className="font-semibold text-gray-900 text-right">{MOCK_CONTRACT.contractNo}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400 shrink-0">임차인</dt>
                    <dd className="font-semibold text-gray-900 text-right">{MOCK_CONTRACT.lesseeName}</dd>
                  </div>
                  <div className="flex justify-between gap-3 items-baseline">
                    <dt className="text-gray-400 shrink-0">차량</dt>
                    <dd className="font-semibold text-gray-900 text-right min-w-0">
                      <span className="font-black">{MOCK_CONTRACT.vehicle}</span>{' '}
                      <span className="font-mono tabular-nums text-gray-800 whitespace-nowrap">
                        ({MOCK_CONTRACT.plate})
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400 shrink-0">보험사 / 접수번호</dt>
                    <dd className="font-semibold text-gray-900 text-right">
                      {MOCK_CONTRACT.insuranceCo} · {MOCK_CONTRACT.claimNo}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400 shrink-0">임대기간</dt>
                    <dd className="font-semibold text-olympos-blue text-right">
                      {MOCK_CONTRACT.startDate} ~ {MOCK_CONTRACT.endDate} ({MOCK_CONTRACT.days}일)
                    </dd>
                  </div>
                </dl>

                <ContractArticle n={1} title="목적">
                  본 계약은 보험사의 보험대차 승인에 따라 임대인이 임차인에게 자동차를 임대하고, 임차인이 사용 대가 및 부대 의무를 이행함을 확정하기 위합니다.
                </ContractArticle>
                <ContractArticle n={2} title="임대차량">
                  차종 및 등록번호는 상기 표 기재와 같으며, 임차인은 인도 즉시 외관·작동 상태를 확인한 것으로 합니다.
                </ContractArticle>
                <ContractArticle n={3} title="임대기간·반환">
                  임차인은 {MOCK_CONTRACT.startDate}부터 {MOCK_CONTRACT.endDate}까지 차량을 사용하고, 기간 종료 후 지체 없이 반환합니다. 반환 지연 시 연체료 등 별도 비용이 발생할 수 있습니다.
                </ContractArticle>
                <ContractArticle n={4} title="임차료·보증금">
                  일 대여료 {MOCK_CONTRACT.dailyRate.toLocaleString('ko-KR')}원, 보증금{' '}
                  {MOCK_CONTRACT.deposit.toLocaleString('ko-KR')}원이며, 확정 결제는 보험 처리 및 반납 검수 후 정산 내역에 따릅니다.
                </ContractArticle>
                <ContractArticle n={5} title="금지행위">
                  영업용 운행, 무단 전대·양도, 법령 위반 운행, 차량의 가혹한 사용 등은 금지됩니다.
                </ContractArticle>
                <ContractArticle n={6} title="사고·도난">
                  사고·도난 발생 시 지체 없이 임대인 및 보험사에 통지하고, 필요 서류 제출 등 절차에 협조합니다.
                </ContractArticle>
                <ContractArticle n={7} title="개인정보">
                  계약 이행·보험 처리·정산을 위해 필요한 범위에서 개인정보가 처리될 수 있습니다.
                </ContractArticle>
                <ContractArticle n={8} title="준거법">
                  본 계약은 대한민국 법령을 준거법으로 하며, 분쟁 시 관할은 관련 법령 및 약정에 따릅니다.
                </ContractArticle>

                {/* 임차인 서명 블록 */}
                <div className="pt-2 pb-1 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2">임차인 서명</p>
                  <button
                    type="button"
                    onClick={() => setSigOpen(true)}
                    className={`w-full rounded-2xl border-2 border-dashed px-3 py-4 text-center transition-colors ${
                      signatureDataUrl
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-300 bg-gray-50/50 hover:bg-olympos-blue-lt'
                    }`}
                    style={
                      !signatureDataUrl
                        ? { borderColor: 'rgba(27, 79, 191, 0.35)' }
                        : undefined
                    }
                  >
                    {signatureDataUrl ? (
                      <img
                        src={signatureDataUrl}
                        alt="임차인 서명"
                        className="mx-auto max-h-20 object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-olympos-blue">
                        탭하여 서명하기
                      </span>
                    )}
                  </button>
                  {signatureDataUrl && (
                    <button
                      type="button"
                      onClick={() => setSigOpen(true)}
                      className="mt-2 text-xs font-semibold text-gray-500 underline underline-offset-2"
                    >
                      서명 다시 하기
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 확인 체크 */}
            <label className="flex items-start gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm cursor-pointer active:bg-gray-50/80">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 shrink-0 accent-olympos-blue"
              />
              <span className="text-xs text-gray-700 leading-relaxed font-medium">
                위 계약 내용을 모두 읽었으며, 보험대차 조건 및 반납·정산 정책에 동의합니다.
              </span>
            </label>

            <button
              type="button"
              onClick={() => navigate('detail')}
              className="w-full py-2.5 rounded-2xl text-sm font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.99]"
            >
              내 정산 내역 확인 →
            </button>
          </div>
        </main>

        {/* 서명 완료 후: PDF 저장 + 보험사 전달 (탭바 바로 위) */}
        <footer className="shrink-0 z-30 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100 shadow-[0_-6px_20px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] text-center text-gray-400 mb-1.5 leading-snug px-1">
            {!hasSigned
              ? '계약 내용 확인 후 임차인 서명을 완료하면 PDF 저장 및 보험사 전송을 진행할 수 있습니다.'
              : '동의하신 뒤 PDF를 저장하거나 보험사로 전자 전송할 수 있습니다.'}
          </p>
          <div className="flex flex-col gap-1.5">
            {hasSigned && (
              <button
                type="button"
                disabled={pdfBusy}
                onClick={handlePdfDownload}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold text-olympos-blue border-2 border-olympos-blue bg-white
                           hover:bg-olympos-blue-lt transition-colors shadow-sm shadow-blue-100/80 active:scale-[0.98] disabled:opacity-45"
              >
                {pdfBusy ? 'PDF 준비 중…' : '계약서 PDF 다운로드'}
              </button>
            )}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleInsuranceSubmit}
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-white bg-olympos-blue
                         hover:bg-olympos-navy transition-colors shadow-md shadow-blue-200 active:scale-[0.98]
                         disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
            >
              보험사에게 계약서 전달하기
            </button>
          </div>
        </footer>
      </div>

      <ContractSignatureModal
        open={sigOpen}
        onClose={() => setSigOpen(false)}
        onComplete={(url) => setSignatureDataUrl(url)}
      />

      {submitting && (
        <div className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[1px] flex items-center justify-center px-8">
          <div className="bg-white rounded-2xl px-6 py-6 max-w-[320px] w-full text-center shadow-2xl border border-gray-100">
            <div
              className="mx-auto w-10 h-10 border-[3px] border-gray-200 border-t-olympos-blue rounded-full animate-spin mb-4"
              aria-hidden
            />
            <p className="text-sm font-bold text-gray-900 leading-snug">
              현대해상으로 계약서를 전송 중입니다...
            </p>
            <p className="text-[11px] text-gray-400 mt-2">잠시만 기다려 주세요</p>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 z-[80] px-4 w-[min(100%,400px)] pointer-events-none`}
          style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div
            className={`rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-xl border ${
              toast.tone === 'success'
                ? 'bg-gray-900 text-white border-gray-700'
                : 'bg-red-50 text-red-800 border-red-100'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function ContractArticle({ n, title, children }) {
  return (
    <section>
      <h4 className="text-xs font-black text-olympos-blue mb-1">
        제{n}조 ({title})
      </h4>
      <p className="text-[13px] text-gray-700 leading-[1.65]">{children}</p>
    </section>
  );
}
