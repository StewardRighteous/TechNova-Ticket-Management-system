import { useEffect, useState } from "react";
import type { Notification } from "../../types/barrel";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

const styles = {
  urgent: {
    icon: "priority_high",
    badge: "bg-amber-100 text-amber-700",
    surface: "border-amber-100 bg-amber-50/80",
  },
  assignment: {
    icon: "person",
    badge: "bg-teal-100 text-teal-700",
    surface: "border-teal-100 bg-teal-50/80",
  },
  sla: {
    icon: "schedule",
    badge: "bg-violet-100 text-violet-800",
    surface: "border-slate-200 bg-white",
  },
  update: {
    icon: "notifications",
    badge: "bg-cyan-100 text-cyan-700",
    surface: "border-slate-200 bg-white",
  },
};

function notificationStyle({ title, message, icon }: Notification) {
  const text = `${title} ${message} ${icon}`.toLowerCase();
  if (/sla|deadline|clock/.test(text)) return styles.sla;
  if (/escalat|urgent|warning/.test(text)) return styles.urgent;
  if (/assign|person/.test(text)) return styles.assignment;
  return styles.update;
}

function relativeTime(createdAt: string, now: number) {
  const minutes = Math.max(1, Math.round((now - Date.parse(createdAt)) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

interface NotificationListProps {
  notifications: Notification[];
  variant?: "full" | "compact";
  className?: string;
  emptyMessage?: string;
  getTicketCode?: (id: string) => string | undefined;
  getAction: (notification: Notification) => (() => void) | undefined;
}

export function NotificationList({
  notifications,
  variant = "full",
  className = "",
  emptyMessage = "No notifications.",
  getTicketCode,
  getAction,
}: NotificationListProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!notifications.length)
    return <p className="p-8 text-center text-sm text-slate-500">{emptyMessage}</p>;

  return (
    <ul className={`${variant === "compact" ? "divide-y divide-slate-100" : "space-y-3"} ${className}`}>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationRow
            notification={notification}
            variant={variant}
            time={relativeTime(notification.createdAt, now)}
            code={notification.ticketId ? getTicketCode?.(notification.ticketId) : undefined}
            onOpen={getAction(notification)}
          />
        </li>
      ))}
    </ul>
  );
}

function NotificationRow({
  notification,
  variant,
  time,
  code,
  onOpen,
}: {
  notification: Notification;
  variant: "full" | "compact";
  time: string;
  code?: string;
  onOpen?: () => void;
}) {
  const compact = variant === "compact";
  const style = notificationStyle(notification);
  const indicator = !notification.read && (
    <span role="img" aria-label="Unread" className="size-2 shrink-0 rounded-full bg-teal-500" />
  );
  const badge = (
    <Icon
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? "size-8 text-lg" : "size-12 text-2xl"} ${style.badge}`}
    >
      {style.icon}
    </Icon>
  );
  const body = (
    <span className="min-w-0 flex-1">
      <span className={`block truncate font-bold text-slate-900 ${compact ? "text-xs" : "text-sm"}`}>
        {notification.title}
      </span>
      <span
        className={`mt-1 block leading-5 text-slate-600 ${compact ? "line-clamp-2 text-xs" : "text-sm"}`}
      >
        {code && <strong className="text-teal-700">{code} </strong>}
        {notification.message}
      </span>
    </span>
  );
  const timestamp = (
    <time
      dateTime={notification.createdAt}
      className={`shrink-0 text-slate-500 ${compact ? "text-[10px]" : "hidden text-sm sm:block"}`}
    >
      {time}
    </time>
  );

  if (compact) {
    return (
      <Button
        type="button"
        tone="plain"
        disabled={!onOpen}
        onClick={onOpen}
        className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent"
      >
        {badge}
        {body}
        {timestamp}
        {indicator}
      </Button>
    );
  }

  return (
    <article
      className={`flex min-w-0 flex-wrap items-center gap-3 rounded-xl border px-4 py-4 sm:gap-5 sm:px-6 ${notification.read ? "border-slate-200 bg-white" : style.surface}`}
    >
      {badge}
      {body}
      {timestamp}
      {indicator}
      {onOpen && (
        <Button type="button" tone="secondary" size="small" onClick={onOpen}>
          View ticket
          <Icon aria-hidden="true" className="text-base">
            arrow_forward
          </Icon>
        </Button>
      )}
    </article>
  );
}
