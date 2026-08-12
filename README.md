# @forahia/herald-client

> Official Open-Source JavaScript & TypeScript SDK for **Herald** — Multi-Tenant Notification & Webhook Delivery Engine.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 Use Cases

`herald-js-client` provides typed API bindings and pre-built React hooks for interacting with the **Herald API**. It is built for 3 core use-cases:

1. **Product Integrations**:
   Trigger email, SMS, and push notifications directly from web apps (e.g., *AuraMed* appointment reminders, *StoreCore* order updates, *Forahia LMS* assignment alerts).
2. **Real-Time Delivery Tracking**:
   Subscribe to live notification status updates using `useNotificationStatus` and `useNotificationFeed` to display real-time sending indicators in your admin panels.
3. **Powering Custom SaaS Dashboards**:
   Acts as the core data engine powering multi-tenant administrative interfaces (such as `herald-cloud`).

---

## 📦 Installation

```bash
npm install @forahia/herald-client
# or
yarn add @forahia/herald-client
# or
pnpm add @forahia/herald-client
```

---

## 🚀 Quick Start

### 1. Basic Client Usage (Node.js / Browser)

```typescript
import { HeraldClient } from "@forahia/herald-client";

const herald = new HeraldClient({
  baseUrl: "http://localhost:8080", // Herald-API server URL
  apiKey: "hrld_live_your_tenant_key",
});

// Create and dispatch a notification
const notification = await herald.createNotification({
  channel: "email",
  recipient: "doctor@auramed.cc",
  subject: "Appointment Scheduled",
  body: "Patient John Doe has confirmed appointment #1042.",
  priority: "high",
  metadata: { appointmentId: "1042" },
});

console.log("Notification queued:", notification.id);
```

---

### 2. Live Status Tracking in React

```tsx
import React, { useState } from "react";
import { heraldClient, useNotificationStatus } from "@forahia/herald-client";

export function NotificationTracker() {
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const { notification, isLoading, isTerminal } = useNotificationStatus(notificationId);

  const sendAlert = async () => {
    const res = await heraldClient.createNotification({
      channel: "sms",
      recipient: "+2348012345678",
      body: "Security Alert: New login detected.",
    });
    setNotificationId(res.id);
  };

  return (
    <div>
      <button onClick={sendAlert}>Send Alert</button>

      {notification && (
        <div>
          <p>Status: <strong>{notification.status}</strong></p>
          {isTerminal && notification.status === "sent" && <p>✅ Delivered!</p>}
        </div>
      )}
    </div>
  );
}
```

---

## 📄 API Reference

### `HeraldClient`
* `createNotification(input: CreateNotificationInput): Promise<Notification>`
* `getNotification(id: string): Promise<Notification>`
* `listNotifications(params?: ListNotificationsParams): Promise<Notification[]>`
* `checkHealth(): Promise<boolean>`

### React Hooks
* `useNotificationStatus(id: string | null, options?: UseNotificationStatusOptions)`
* `useNotificationFeed(options?: UseNotificationFeedOptions)`

---

## 📄 License
MIT License &copy; Forahia Solutions.
