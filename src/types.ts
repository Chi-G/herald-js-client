export type NotificationChannel = "email" | "sms" | "push";

export type NotificationStatus =
  | "pending"
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "retrying"
  | "cancelled";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  tenant_id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority | string;
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  attempt_count: number;
  max_attempts: number;
  created_at: string;
  sent_at?: string;
  failed_at?: string;
}

export interface CreateNotificationInput {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}

export interface ListNotificationsParams {
  status?: NotificationStatus | "all";
  limit?: number;
  offset?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface HeraldClientConfig {
  baseUrl?: string;
  apiKey?: string;
}
