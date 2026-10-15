import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, type LoginInput } from '../api/login';
import { getMe } from '../api/me';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      const me = await getMe();
      queryClient.setQueryData(['auth', 'me'], me);
    },
  });
}
