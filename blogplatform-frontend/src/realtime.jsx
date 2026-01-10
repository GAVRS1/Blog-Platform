// src/realtime.js
import * as signalR from '@microsoft/signalr';
import { API_BASE } from './api/config';

let messageAudioContext;
let activeChatConnection;

const playMessageSound = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  if (!messageAudioContext) {
    messageAudioContext = new AudioContext();
  }

  const context = messageAudioContext;
  if (context.state === 'suspended') {
    context.resume().catch(() => {});
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gainNode.gain.value = 0.08;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  const stopAt = context.currentTime + 0.18;
  oscillator.start();
  oscillator.stop(stopAt);

  oscillator.onended = () => {
    oscillator.disconnect();
    gainNode.disconnect();
  };
};

export function connectRealtime(jwt, handlers = {}) {
  const {
    onMessage,
    onNotification,
    onStatus,
    onPresence,
    onReads
  } = handlers;
  const baseOptions = {
    withCredentials: true,
  };
  const buildOptions = () => (jwt
    ? { ...baseOptions, accessTokenFactory: () => jwt }
    : { ...baseOptions });

  const chat = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/hubs/chat`, buildOptions())
    .withAutomaticReconnect()
    .build();

  const notify = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/hubs/notifications`, buildOptions())
    .withAutomaticReconnect()
    .build();

  chat.on('MessageReceived', (m) => {
    onMessage?.(m);
    playMessageSound();
  });

  chat.on('UserOnline', (payload) => {
    onPresence?.({ type: 'online', ...payload });
  });

  chat.on('UserOffline', (payload) => {
    onPresence?.({ type: 'offline', ...payload });
  });

  chat.on('UserTyping', (payload) => {
    onPresence?.({ type: 'typing', ...payload });
  });

  chat.on('MessagesRead', (payload) => {
    onReads?.(payload);
  });

  notify.on('NotificationReceived', (n) => {
    onNotification?.(n);
  });

  const start = async () => {
    try {
      await chat.start();
      await notify.start();
      activeChatConnection = chat;
      onStatus?.({ type: 'connected' });
    } catch (e) {
      console.warn('Realtime start error:', e);
      onStatus?.({ type: 'error', error: e });
      setTimeout(start, 2000);
    }
  };

  chat.onreconnecting((error) => {
    onStatus?.({ type: 'reconnecting', error });
  });

  chat.onreconnected((connectionId) => {
    onStatus?.({ type: 'reconnected', connectionId });
  });

  chat.onclose((error) => {
    onStatus?.({ type: 'closed', error });
  });

  const stop = async () => {
    try {
      await chat.stop();
      await notify.stop();
      if (activeChatConnection === chat) {
        activeChatConnection = null;
      }
    } catch (e) {}
  };

  return { chat, notify, start, stop };
}

export async function sendTyping(recipientUserId, isTyping) {
  if (!activeChatConnection) return;
  try {
    await activeChatConnection.invoke('SendTyping', recipientUserId, isTyping);
  } catch (e) {
    // ignore
  }
}
