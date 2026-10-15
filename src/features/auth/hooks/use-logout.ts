import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/logout';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      window.dispatchEvent(new Event('moment:session-ended'));
    },
  });
}
