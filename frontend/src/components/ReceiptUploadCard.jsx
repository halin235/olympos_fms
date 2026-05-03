import { useState, useRef, useCallback } from 'react';
import { receiptApi } from '../api/settlementApi';

// ─────────────────────────────────────────────────────────────
// 1. 운영자 검토 중 배너 (pending_review 상태 전용)
//    → 요구사항 3: 결제 HOLD 상태 고객 안내 문구
// ─────────────────────────────────────────────────────────────
export function PendingReviewBanner({ uploadedAt }) {
  const ts = uploadedAt
    ? new Date(uploadedAt).toLocaleString('ko-KR', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
      {/* 상단 컬러 바 */}
      <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />

      <div className="p-5 space-y-3">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">영수증 접수 완료</p>
            {ts && <p className="text-xs text-gray-400 mt-0.5">{ts} 접수</p>}
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full
                           bg-orange-100 border border-orange-200 px-2.5 py-1
                           text-xs font-bold text-orange-700">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
            검토 중
          </span>
        </div>

        {/* 핵심 안내 문구 — 요구사항 3 */}
        <div className="bg-orange-50 rounded-xl px-4 py-3">
          <p className="text-sm text-orange-800 leading-relaxed font-medium">
            영수증이 접수되어 운영자가 확인 중입니다.
            <br />
            <span className="text-orange-600">확인 후 최종 정산됩니다.</span>
          </p>
        </div>

        {/* 결제 HOLD 표시 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>자동 결제가 <strong className="text-gray-700">보류</strong>되었습니다. 운영자 확인 완료 후 재개됩니다.</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. 파일 미리보기 섬네일
// ─────────────────────────────────────────────────────────────
function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const isPdf   = file.type === 'application/pdf';
  const url     = isImage ? URL.createObjectURL(file) : null;
  const sizeMB  = (file.size / 1024 / 1024).toFixed(1);

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
      {/* 썸네일 */}
      {isImage ? (
        <img src={url} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 파일명 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{isPdf ? 'PDF' : '이미지'} · {sizeMB}MB</p>
      </div>

      {/* 제거 버튼 */}
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500
                   flex items-center justify-center transition-colors flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. 업로드 진행률 바
// ─────────────────────────────────────────────────────────────
function ProgressBar({ progress }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>업로드 중…</span>
        <span className="font-semibold tabular-nums">{progress}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-olympos-blue to-blue-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. 메인 컴포넌트: ReceiptUploadCard
//    요구사항 1: '작성하기'/'상세보기' 버튼과 동일 스타일
//    요구사항 2: receipt_url, is_disputed 필드 업데이트 트리거
//    요구사항 3: 업로드 즉시 pending_review 전환 + HOLD 안내
// ─────────────────────────────────────────────────────────────
export default function ReceiptUploadCard({ contractId, onUploaded }) {
  const [file,         setFile]         = useState(null);
  const [disputeNote,  setDisputeNote]  = useState('');
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [error,        setError]        = useState(null);
  const [isDragOver,   setIsDragOver]   = useState(false);
  const inputRef = useRef(null);

  // ── 파일 선택 핸들러
  const handleFile = useCallback((selected) => {
    setError(null);
    const f = selected instanceof FileList ? selected[0] : selected;
    if (!f) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setError('JPG, PNG, WEBP, PDF 파일만 첨부 가능합니다.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    setFile(f);
  }, []);

  // ── 드래그앤드롭
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files);
  }, [handleFile]);

  // ── 업로드 실행 (요구사항 2, 3의 핵심 트리거)
  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await receiptApi.upload(
        contractId,
        file,
        disputeNote,
        setProgress
      );
      // 부모 컴포넌트에 업로드 완료 & 새 settlement 데이터 전달
      onUploaded?.(result.data.settlement);
    } catch (err) {
      setError(err.response?.data?.message || '업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 상단 컬러 바 */}
      <div className="h-1 bg-gradient-to-r from-olympos-blue to-blue-400" />

      <div className="p-5 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-olympos-blue inline-block" />
          <h3 className="text-base font-bold text-gray-900">주유 영수증 첨부</h3>
          <span className="ml-auto text-xs text-gray-400">분쟁 시 증거 자료로 활용됩니다</span>
        </div>

        {/* 이의 제기 안내 */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
          <svg className="w-4 h-4 text-olympos-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700 leading-relaxed">
            영수증 첨부 시 정산이 <strong>운영자 검토 상태로 전환</strong>되며,
            확인 완료 전까지 <strong>자동 결제가 중단</strong>됩니다.
          </p>
        </div>

        {/* 파일 드롭존 or 미리보기 */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
              ${isDragOver
                ? 'border-olympos-blue bg-olympos-blue-lt scale-[1.01]'
                : 'border-gray-200 bg-gray-50 hover:border-olympos-blue hover:bg-olympos-blue-lt'}`}
          >
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm
                            flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-olympos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">파일을 드래그하거나 클릭하여 첨부</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, PDF · 최대 10MB</p>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
            />
          </div>
        ) : (
          <FilePreview file={file} onRemove={() => { setFile(null); setProgress(0); }} />
        )}

        {/* 이의 제기 사유 입력 (선택) */}
        {file && !uploading && (
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">이의 제기 사유 <span className="text-gray-400 font-normal">(선택)</span></span>
            <textarea
              value={disputeNote}
              onChange={(e) => setDisputeNote(e.target.value)}
              rows={2}
              placeholder="예: 주유 후 즉시 반납하여 연료가 부족하지 않습니다."
              className="mt-1.5 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5
                         focus:outline-none focus:border-olympos-blue focus:ring-1 focus:ring-olympos-blue/20
                         resize-none text-gray-700 placeholder:text-gray-300 leading-relaxed"
            />
          </label>
        )}

        {/* 진행률 바 */}
        {uploading && <ProgressBar progress={progress} />}

        {/* 오류 메시지 */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* ── 주유 영수증 첨부하기 버튼
            요구사항 1: 앱 이미지의 '작성하기' 버튼과 동일 스타일
            - border: 1.5px solid #1B4FBF (olympos-blue)
            - radius: rounded-lg (8px) — 앱 내 작성하기/상세보기 버튼과 일치
            - font-weight: font-semibold (600)
            - 색상: text-olympos-blue (비활성화: 그라디언트 채움)
        ── */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-all
            ${!file || uploading
              ? 'border-2 border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
              : uploading
                ? 'border-2 border-olympos-blue/40 text-olympos-blue/60 bg-white cursor-wait'
                : 'border-2 border-olympos-blue text-olympos-blue bg-white hover:bg-olympos-blue-lt active:scale-[0.98]'
            }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4 text-olympos-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              업로드 중…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              주유 영수증 첨부하기
            </span>
          )}
        </button>

        {/* 파일 없을 때 안내 */}
        {!file && (
          <p className="text-xs text-gray-400 text-center">
            영수증이 없다면 첨부하지 않아도 됩니다
          </p>
        )}
      </div>
    </div>
  );
}
