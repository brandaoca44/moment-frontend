import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProfileAppearance() {
  const client=useQueryClient();
  return useMutation({
    mutationFn:(choice:{theme?:string;font?:string})=>api<{data:{synced:boolean}}>('/plans/profile/appearance',{method:'PATCH',body:JSON.stringify(choice)}),
    onSuccess:async result=>{if(result.data.synced)await Promise.all(['profile','premium-profile'].map(key=>client.invalidateQueries({queryKey:[key]})));},
  });
}
