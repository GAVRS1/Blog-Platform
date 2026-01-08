// src/realtimeEvents.js
const messageTarget = new EventTarget();
const statusTarget = new EventTarget();

export function emitRealtimeMessage(message) {
  messageTarget.dispatchEvent(new CustomEvent('message', { detail: message }));
}

export function subscribeToRealtimeMessages(handler) {
  if (!handler) return () => {};
  const listener = (event) => handler(event.detail);
  messageTarget.addEventListener('message', listener);
  return () => messageTarget.removeEventListener('message', listener);
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
