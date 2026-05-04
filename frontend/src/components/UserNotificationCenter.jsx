/**
 * 고객 알림 센터 — 카드형 · 부드러운 가독성
 */

import { DEMO_DISPLAY_ANCHOR_DATE_KO } from '../constants/demoTimeline';
import { USER_NOTIFICATIONS, USER_NOTIFICATION_CATEGORY } from '../data/userNotifications';

export default function UserNotificationCenter() {
  const unreadCount = USER_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="px-4 pt-3 pb-6 space-y-3 max-w-[430px] mx-auto">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">알림</p>
          <h2 className="text-sm font-bold text-gray-900">나에게 온 안내</h2>
        </div>
        <p className="text-[10px] text-gray-400 tabular-nums">{DEMO_DISPLAY_ANCHOR_DATE_KO} 기준</p>
      </div>

      {unreadCount > 0 ? (
        <div className="rounded-xl bg-olympos-blue-lt border border-blue-100 px-3 py-2 text-[11px] text-olympos-blue font-semibold">
          읽지 않은 알림 {unreadCount}건이 있어요.
        </div>
      ) : null}

      <div className="space-y-3">
        {USER_NOTIFICATIONS.map((item) => {
          const cat = USER_NOTIFICATION_CATEGORY[item.categoryKey];
          return (
            <article
              key={item.id}
              className={`rounded-2xl border shadow-sm bg-white overflow-hidden transition-shadow hover:shadow-md ${
                item.unread ? 'ring-1 ring-blue-100 border-blue-100' : 'border-gray-100'
              }`}
            >
              <div className="px-4 pt-3 pb-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${cat.tone}`}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">{item.timeLabel}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{item.title}</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">{item.body}</p>
              </div>
              {item.unread ? (
                <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-olympos-blue hover:underline"
                  >
                    확인했어요
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
