import { useEffect } from 'react';
import UserBottomNav from '../components/UserBottomNav';

/** 하단 탭 높이 + 안전 영역 — 본문 마지막 버튼이 탭에 가리지 않도록 */
const CONTENT_BOTTOM_SAFE =
  'pb-[calc(6rem+env(safe-area-inset-bottom,0px))]';

/**
 * 고객(B2C) 공통 셸 — 하단 탭을 한 번만 마운트하여 전환 시 깜빡임 최소화
 *
 * 스크롤: 내부 overflow 트랩 대신 **문서 스크롤 + sticky 탭바** (모바일 웹뷰에서 flex-1 트랩이
 * 스크롤을 막는 경우가 많아 이 방식으로 통일)
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
    <div className="relative mx-auto flex min-h-[100dvh] min-h-screen w-full max-w-[430px] flex-col bg-gray-50">
      <div className={`flex min-h-0 w-full flex-1 flex-col ${CONTENT_BOTTOM_SAFE}`}>
        {children}
      </div>
      <div className="sticky bottom-0 z-40 w-full shrink-0">
        <UserBottomNav navigate={navigate} active={navActive} />
      </div>
    </div>
  );
}
