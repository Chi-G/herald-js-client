import React, { useState } from "react";
import { heraldClient, useNotificationStatus } from "../src";

export function NotificationSenderExample() {
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { notification, error, isTerminal } = useNotificationStatus(notificationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await heraldClient.createNotification({
        channel: "email",
        recipient,
        subject: "AuraMed Appointment Reminder",
        body,
        priority: "high",
        metadata: { source: "admin-dashboard" },
      });
      setNotificationId(result.id);
    } catch (err) {
      console.error("Failed to send notification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "480px", padding: "20px", fontFamily: "sans-serif" }}>
      <h3>Dispatch Notification</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="email"
          placeholder="Recipient email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          style={{ padding: "8px", fontSize: "14px" }}
        />
        <textarea
          placeholder="Message body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          style={{ padding: "8px", fontSize: "14px" }}
        />
        <button type="submit" disabled={submitting} style={{ padding: "10px", fontWeight: "bold" }}>
          {submitting ? "Dispatching..." : "Send Notification"}
        </button>
      </form>

      {notification && (
        <div style={{ marginTop: "16px", padding: "12px", background: "#f5f5f5", borderRadius: "6px" }}>
          <p style={{ margin: "4px 0" }}>Status: <strong>{notification.status}</strong></p>
          <p style={{ margin: "4px 0" }}>Attempts: {notification.attempt_count} / {notification.max_attempts}</p>
          {isTerminal && notification.status === "sent" && <p style={{ color: "green" }}>✅ Delivered</p>}
          {isTerminal && notification.status === "failed" && <p style={{ color: "red" }}>❌ Delivery failed</p>}
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
    </div>
  );
}
