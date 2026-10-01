import { createBrowserRouter } from 'react-router-dom';
import { LegalPage } from '@/features/legal/legal-pages';
import { StationsPage, StationPage, TopicPage } from '@/features/stations/stations-pages';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { GuestRoute } from '@/components/layout/guest-route';
import { FeedPage } from '@/features/feed/pages/feed-page';
import { PostPage } from '@/features/feed/pages/post-page';
import { ReportsPage } from '@/features/reports/reports-page';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { NotificationsPage } from '@/features/notifications/pages/notifications-page';
import { ProfilePage } from '@/features/profile/pages/profile-page';
import { SettingsPage } from '@/features/settings/pages/settings-page';
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password-page';
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page';
import { ExplorePage } from '@/features/explore/pages/explore-page';

export const router = createBrowserRouter([
  { path: '/terms', element: <LegalPage page="terms" /> },
  { path: '/privacy', element: <LegalPage page="privacy" /> },
  { path: '/support', element: <LegalPage page="support" /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <FeedPage /> },
          { path: 'communities', element: <StationsPage /> },
          { path: 'communities/topics/:topicId', element: <TopicPage /> },
          { path: 'communities/:id', element: <StationPage /> },
          { path: 'posts/:id', element: <PostPage /> },
          { path: 'moderation', element: <ReportsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'explore', element: <ExplorePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/:username', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
]);
