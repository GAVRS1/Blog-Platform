// src/realtime.js
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

export function connectRealtime(jwt, handlers = {}) {
  const { onMessage, onNotification } = handlers;

  const chat = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_BASE}/hubs/chat`, {
      accessTokenFactory: () => jwt
    })
    .withAutomaticReconnect()
    .build();

  const notify = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_BASE}/hubs/notifications`, {
      accessTokenFactory: () => jwt
    })
    .withAutomaticReconnect()
    .build();

  chat.on('MessageReceived', (m) => {
    onMessage?.(m);
    toast.custom(() => (
      <div className="alert alert-info shadow-lg max-w-md">
        <span>Новое сообщение от #{m.senderId}: {m.content?.slice(0, 80)}</span>
      </div>
    ), { id: `msg-${m.id}`, duration: 3000 });
  });

  notify.on('NotificationReceived', (n) => {
    onNotification?.(n);
    toast.custom(() => (
      <div className="alert alert-success shadow-lg max-w-md">
        <span>Уведомление: {n.text || n.type}</span>
      </div>
    ), { id: `notif-${n.id}`, duration: 2500 });
  });

  const start = async () => {
    try {
      await chat.start();
      await notify.start();
    } catch (e) {
      console.warn('Realtime start error:', e);
      setTimeout(start, 2000);
    }
  };

  const stop = async () => {
    try {
      await chat.stop();
      await notify.stop();
    } catch (e) {}
  };

  return { chat, notify, start, stop };
}