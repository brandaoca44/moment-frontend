import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Broadcast only invalidation, never cookies, user data or session credentials.
export function SessionSync() {
  const client = useQueryClient();
  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('moment-session') : null;
    const clear = () => {
      void client.cancelQueries();
      client.clear();
      client.setQueryData(['auth', 'me'], { data: { user: null } });
    };
    const ended = () => { clear(); channel?.postMessage('ended'); };
    window.addEventListener('moment:session-ended', ended);
    if (channel) channel.onmessage = event => { if (event.data === 'ended') clear(); };
    return () => { window.removeEventListener('moment:session-ended', ended); channel?.close(); };
  }, [client]);
  return null;
}
