import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { FeedPage } from '@/features/feed/pages/feed-page';
import { PostPage } from '@/features/feed/pages/post-page';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { NotificationsPage } from '@/features/notifications/pages/notifications-page';
import { ProfilePage } from '@/features/profile/pages/profile-page';
import { SettingsPage } from '@/features/settings/pages/settings-page';
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password-page';
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page';
import { ExplorePage } from '@/features/explore/pages/explore-page';

export const router = createBrowserRouter([
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
          { path: 'posts/:id', element: <PostPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'explore', element: <ExplorePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/profile/:username',
    element: <ProtectedRoute />,
    children: [{ path: '', element: <ProfilePage /> }],
  },
]);
