import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteMe, type DeleteMeInput } from '../api/settings';

export function useDeleteMe() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: DeleteMeInput) => deleteMe(data),
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}