import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/contexts/theme-context';
import { LanguageSync } from '@/i18n/language-picker';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageSync />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
