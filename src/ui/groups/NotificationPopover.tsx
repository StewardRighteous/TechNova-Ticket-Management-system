import type { Notification } from "../../types/barrel";
import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { NotificationList } from "./NotificationList";

export function NotificationPopover({
  notifications,
  unreadCount,
  onOpen,
  onViewAll,
}: {
  notifications: Notification[];
  unreadCount: number;
  onOpen: (notification: Notification) => void;
  onViewAll: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Recent notifications"
      className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Heading variant="subsection">Notifications</Heading>
          {unreadCount ? (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {unreadCount} unread
            </span>
          ) : (
            <span className="text-xs text-slate-500">You're all caught up</span>
          )}
        </div>
        <Button
          type="button"
          tone="plain"
          onClick={onViewAll}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View all
        </Button>
      </div>
      <NotificationList
        notifications={notifications}
        variant="compact"
        className="max-h-80 overflow-y-auto"
        emptyMessage="No notifications yet."
        getAction={(notification) => () => onOpen(notification)}
      />
    </div>
  );
}
