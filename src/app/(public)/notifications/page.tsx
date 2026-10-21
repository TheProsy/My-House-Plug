import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, BellOff, Check } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/feedback/empty-state";
import { getSessionUser } from "@/features/authentication/queries";
import { getNotifications } from "@/features/notifications/queries";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Enquiry replies, inspection updates, and account notices.",
};

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirectTo=/notifications");
  }

  const notifications = await getNotifications(user.id);
  const unread = notifications.filter((item) => !item.read_at);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Enquiry replies, inspection updates, and account notices.
          </p>
        </div>
        {unread.length > 0 && (
          <ActionButton
            action={markAllNotificationsReadAction}
            fields={{}}
            successFallback="All notifications marked as read."
            variant="secondary"
            size="sm"
          >
            <Check className="size-3.5" aria-hidden="true" />
            Mark all read
          </ActionButton>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<BellOff className="size-5" aria-hidden="true" />}
          title="Nothing here yet"
          description="When a provider replies or an inspection moves, we will show it here."
        />
      ) : (
        <ul className="mt-6 space-y-2">
          {notifications.map((notification) => {
            const isUnread = !notification.read_at;
            const body = (
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    isUnread ? "bg-brand-500" : "bg-line",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      isUnread ? "font-semibold text-ink-900" : "font-medium text-ink-600",
                    )}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                      {notification.body}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink-400">
                    {timeAgo(notification.created_at)}
                  </p>
                </div>
              </div>
            );

            return (
              <li
                key={notification.id}
                className={cn(
                  "rounded-2xl border p-3.5 shadow-e1 sm:p-4",
                  isUnread
                    ? "border-brand-200 bg-brand-50/60"
                    : "border-line-soft bg-surface-2",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className="min-w-0 flex-1 rounded-xl focus-visible:outline-none"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="min-w-0 flex-1">{body}</div>
                  )}

                  {isUnread && (
                    <ActionButton
                      action={markNotificationReadAction}
                      fields={{ notificationId: notification.id }}
                      successFallback="Marked as read."
                      variant="ghost"
                      size="sm"
                      aria-label="Mark as read"
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                    </ActionButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-400">
        <Bell className="size-3.5" aria-hidden="true" />
        Notifications older than 50 entries are archived automatically.
      </p>
    </div>
  );
}
