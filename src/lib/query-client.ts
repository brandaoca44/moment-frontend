import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !(error instanceof ApiError && [401,403,429].includes(error.status)) && failureCount < 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});
