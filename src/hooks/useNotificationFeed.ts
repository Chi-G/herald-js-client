import { useCallback, useEffect, useState } from "react";
import { HeraldClient, heraldClient as defaultClient } from "../client";
import { Notification, NotificationStatus } from "../types";

export interface UseNotificationFeedOptions {
  client?: HeraldClient;
  status?: NotificationStatus | "all";
  pollIntervalMs?: number;
  limit?: number;
  enabled?: boolean;
}

export function useNotificationFeed(options: UseNotificationFeedOptions = {}) {
  const {
    client = defaultClient,
    status = "all",
    pollIntervalMs = 3000,
    limit = 50,
    enabled = true,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFeed = useCallback(async () => {
    try {
      const data = await client.listNotifications({ status, limit });
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notification feed");
    } finally {
      setIsLoading(false);
    }
  }, [client, status, limit]);

  useEffect(() => {
    if (!enabled) return;

    fetchFeed();
    const interval = setInterval(fetchFeed, pollIntervalMs);

    return () => clearInterval(interval);
  }, [enabled, fetchFeed, pollIntervalMs]);

  return { notifications, error, isLoading, refresh: fetchFeed };
}
