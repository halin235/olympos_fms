import { useEffect } from 'react';
import UserBottomNav from '../components/UserBottomNav';

/** 탭바(~56px) + pb-20급 여유 + 하단 safe-area — 고정 탭에 CTA가 가리지 않도록 */
const CONTENT_BOTTOM_SAFE =
  'pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]';

/**
 * 고객(B2C) 공통 셸 — 하단 탭을 한 번만 마운트하여 전환 시 깜빡임 최소화
 *
 * 스크롤: 문서 스크롤 + **fixed 탭바** (sticky는 모바일에서 시각적 뷰포트와 어긋나 뜬 것처럼 보일 수 있음)
 */
export default function UserFlowLayout({ navigate, navActive, children }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyHeight: body.style.height,
      bodyTouchAction: body.style.touchAction,
      bodyWidth: body.style.width,
    };

    html.style.overflow = '';
    body.style.overflow = '';
    body.style.position = '';
    body.style.height = '';
    body.style.touchAction = '';
    body.style.width = '';

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.height = prev.bodyHeight;
      body.style.touchAction = prev.bodyTouchAction;
      body.style.width = prev.bodyWidth;
    };
  }, []);

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-gray-50">
      <div className={`flex min-h-0 w-full flex-1 flex-col ${CONTENT_BOTTOM_SAFE}`}>
        {children}
      </div>
      {/* 시각적 뷰포트 하단 고정 (sticky는 모바일 주소창/레이아웃과 어긋날 수 있음) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center">
        <div className="pointer-events-auto w-full max-w-[430px]">
          <UserBottomNav navigate={navigate} active={navActive} />
        </div>
      </div>
    </div>
  );
}
