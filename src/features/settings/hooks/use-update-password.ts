import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../api/settings';

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}