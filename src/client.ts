import {
  ApiResponse,
  CreateNotificationInput,
  HeraldClientConfig,
  ListNotificationsParams,
  Notification,
} from "./types";

export class HeraldError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "HeraldError";
    this.code = code;
  }
}

export class HeraldClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: HeraldClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? "http://localhost:8080").replace(/\/+$/, "");
    this.apiKey = config.apiKey;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      h["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return h;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers as Record<string, string>),
      },
    });

    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch {
      throw new HeraldError(`HTTP ${res.status}: Failed to parse JSON response from ${url}`);
    }

    if (!json.success) {
      throw new HeraldError(json.error || `Request failed with status ${res.status}`, json.code);
    }

    return json.data;
  }

  /** Check backend health */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Create and dispatch a new notification */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    return this.request<Notification>("/api/v1/notifications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /** Alias for createNotification */
  async sendNotification(input: CreateNotificationInput): Promise<Notification> {
    return this.createNotification(input);
  }

  /** Fetch notification details by ID */
  async getNotification(id: string): Promise<Notification> {
    return this.request<Notification>(`/api/v1/notifications/${id}`);
  }

  /** List notifications with status/pagination filters */
  async listNotifications(params: ListNotificationsParams = {}): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") {
      query.set("status", params.status);
    }
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    return this.request<Notification[]>(`/api/v1/notifications${qs ? `?${qs}` : ""}`);
  }
}

/** Convenience default instance */
export const heraldClient = new HeraldClient();
