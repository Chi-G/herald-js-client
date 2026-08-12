import { useEffect, useRef, useState } from "react";
import { HeraldClient, heraldClient as defaultClient } from "../client";
import { Notification, NotificationStatus } from "../types";

const TERMINAL_STATUSES: NotificationStatus[] = ["sent", "failed", "cancelled"];

export interface UseNotificationStatusOptions {
  client?: HeraldClient;
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useNotificationStatus(
  notificationId: string | null,
  options: UseNotificationStatusOptions = {}
) {
  const { client = defaultClient, pollIntervalMs = 2000, enabled = true } = options;

  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(notificationId));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!notificationId || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const poll = async () => {
      try {
        const result = await client.getNotification(notificationId);
        setNotification(result);
        setError(null);

        if (TERMINAL_STATUSES.includes(result.status) && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch notification status");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } finally {
        setIsLoading(false);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [notificationId, pollIntervalMs, enabled, client]);

  return {
    notification,
    error,
    isLoading,
    isTerminal: notification ? TERMINAL_STATUSES.includes(notification.status) : false,
  };
}
