import { useEffect, useState } from 'react';
import { messagesService } from '@/services/messages';
import { notificationsService } from '@/services/notifications';
import {
  subscribeToRealtimeNotifications,
  subscribeToRealtimeReads,
  subscribeToUnreadBadgeRefresh
} from '@/realtimeEvents';

export function useUnreadBadges({ user, enabled = true } = {}) {
  const [counts, setCounts] = useState({ messages: 0, notifications: 0 });

  useEffect(() => {
    if (!user || !enabled) {
      setCounts({ messages: 0, notifications: 0 });
      return;
    }

    let alive = true;

    const refreshNotifications = async () => {
      try {
        const n = await notificationsService.unreadCount();
        if (alive) {
          setCounts(prev => ({ ...prev, notifications: n.unread || 0 }));
        }
      } catch {}
    };

    const refreshMessages = async () => {
      try {
        const inbox = await messagesService.getInbox();
        if (alive) {
          const sum = (inbox || []).reduce((acc, x) => acc + (x.unreadCount || 0), 0);
          setCounts(prev => ({ ...prev, messages: sum }));
        }
      } catch {}
    };

    refreshNotifications();
    refreshMessages();

    const unsubscribeNotifications = subscribeToRealtimeNotifications((incoming) => {
      if (!incoming || incoming.isRead) return;
      setCounts(prev => ({ ...prev, notifications: (prev.notifications || 0) + 1 }));
    });

    const unsubscribeReads = subscribeToRealtimeReads(() => {
      refreshMessages();
    });

    const unsubscribeBadges = subscribeToUnreadBadgeRefresh((payload) => {
      if (!payload || payload.type === 'notifications') {
        refreshNotifications();
      }
      if (!payload || payload.type === 'messages') {
        refreshMessages();
      }
    });

    return () => {
      alive = false;
      unsubscribeNotifications();
      unsubscribeReads();
      unsubscribeBadges();
    };
  }, [enabled, user]);

  return counts;
}
