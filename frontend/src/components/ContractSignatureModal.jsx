import { useCallback, useEffect, useRef, useState } from 'react';

/** Tailwind `olympos-blue` — 캔버스 스트로크용 */
const BRAND_BLUE = '#1B4FBF';

/**
 * 임차인 서명용 모달 — 포인터 드로잉 (터치·펜·마우스)
 */
export default function ContractSignatureModal({ open, onClose, onComplete }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [hasInk, setHasInk] = useState(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const r = wrap.getBoundingClientRect();
    const lw = Math.max(r.width, 1);
    const lh = Math.max(r.height, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(lw * dpr);
    canvas.height = Math.floor(lh * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, lw, lh);
    setHasInk(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => initCanvas());
    const ro = new ResizeObserver(() => initCanvas());
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('orientationchange', initCanvas);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      window.removeEventListener('orientationchange', initCanvas);
    };
  }, [open, initCanvas]);

  const pos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    if (e.pointerType === 'touch') e.preventDefault();
    drawingRef.current = true;
    lastRef.current = pos(e);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    if (e.pointerType === 'touch') e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.strokeStyle = BRAND_BLUE;
    ctx.lineWidth = 2.25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastRef.current = { x, y };
    setHasInk(true);
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    initCanvas();
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;
    const url = canvas.toDataURL('image/png');
    onComplete(url);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/45 backdrop-blur-[2px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] justify-end sm:justify-center">
      <div
        className="mx-auto w-full max-w-[400px] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sig-modal-title"
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between gap-2">
          <h2 id="sig-modal-title" className="text-base font-bold text-gray-900">
            임차인 서명
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
        <p className="px-4 pt-3 text-xs text-gray-500 leading-relaxed">
          아래 영역에 손가락 또는 스타일러스로 서명해 주세요.
        </p>
        <div className="px-4 pt-2 pb-4 flex-1 min-h-0">
          <div
            ref={wrapRef}
            className="rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-[#FAFAFA] h-[200px] touch-none"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-crosshair"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                startDraw(e);
              }}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerCancel={endDraw}
            />
          </div>
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="flex-1 py-3 rounded-2xl text-sm font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            지우기
          </button>
          <button
            type="button"
            disabled={!hasInk}
            onClick={handleComplete}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-olympos-blue hover:bg-olympos-navy disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all shadow-md shadow-blue-200"
          >
            서명 완료
          </button>
        </div>
      </div>
    </div>
  );
}
