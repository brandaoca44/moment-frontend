import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/me';

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    // GuestRoute mounts the login/language picker after an anonymous-session error.
    // Retrying on that mount would set loading again, unmount it, and loop forever.
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });
}
