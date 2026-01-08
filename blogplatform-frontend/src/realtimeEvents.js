// src/realtimeEvents.js
const messageTarget = new EventTarget();
const notificationTarget = new EventTarget();
const statusTarget = new EventTarget();
const presenceTarget = new EventTarget();

export function emitRealtimeMessage(message) {
  messageTarget.dispatchEvent(new CustomEvent('message', { detail: message }));
}

export function subscribeToRealtimeMessages(handler) {
  if (!handler) return () => {};
  const listener = (event) => handler(event.detail);
  messageTarget.addEventListener('message', listener);
  return () => messageTarget.removeEventListener('message', listener);
}

export function emitRealtimeNotification(notification) {
  notificationTarget.dispatchEvent(new CustomEvent('notification', { detail: notification }));
}

export function subscribeToRealtimeNotifications(handler) {
  if (!handler) return () => {};
  const listener = (event) => handler(event.detail);
  notificationTarget.addEventListener('notification', listener);
  return () => notificationTarget.removeEventListener('notification', listener);
}

export function emitRealtimeStatus(status) {
  statusTarget.dispatchEvent(new CustomEvent('status', { detail: status }));
}

export function subscribeToRealtimeStatus(handler) {
  if (!handler) return () => {};
  const listener = (event) => handler(event.detail);
  statusTarget.addEventListener('status', listener);
  return () => statusTarget.removeEventListener('status', listener);
}

export function emitRealtimePresence(update) {
  presenceTarget.dispatchEvent(new CustomEvent('presence', { detail: update }));
}

export function subscribeToRealtimePresence(handler) {
  if (!handler) return () => {};
  const listener = (event) => handler(event.detail);
  presenceTarget.addEventListener('presence', listener);
  return () => presenceTarget.removeEventListener('presence', listener);
}
