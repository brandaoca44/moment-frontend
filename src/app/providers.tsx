import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/contexts/theme-context';
import { LanguageSync } from '@/i18n/language-picker';
import { FontSync } from '@/features/plans/font-selector';
import { SessionSync } from '@/features/auth/session-sync';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionSync />
        <LanguageSync />
        <FontSync />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
