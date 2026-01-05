import { useEffect, useState } from 'react';
import { messagesService } from '@/services/messages';
import { notificationsService } from '@/services/notifications';

export function useUnreadBadges({ user, enabled = true } = {}) {
  const [counts, setCounts] = useState({ messages: 0, notifications: 0 });

  useEffect(() => {
    if (!user || !enabled) {
      setCounts({ messages: 0, notifications: 0 });
      return;
    }

    let alive = true;

    (async () => {
      try {
        const n = await notificationsService.unreadCount();
        if (alive) {
          setCounts(prev => ({ ...prev, notifications: n.unread || 0 }));
        }
      } catch {}

      try {
        const inbox = await messagesService.getInbox();
        if (alive) {
          const sum = (inbox || []).reduce((acc, x) => acc + (x.unreadCount || 0), 0);
          setCounts(prev => ({ ...prev, messages: sum }));
        }
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, [enabled, user]);

  return counts;
}
