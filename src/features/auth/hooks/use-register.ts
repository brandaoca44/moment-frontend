import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser, type RegisterInput } from '../api/register';
import { getMe } from '../api/me';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: async () => {
      const me = await getMe();
      queryClient.setQueryData(['auth', 'me'], me);
    },
  });
}