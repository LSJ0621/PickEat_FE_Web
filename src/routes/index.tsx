/**
 * 라우팅 설정
 * 모든 라우트를 한 곳에서 관리합니다.
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/Home';
import { LoginPage } from '../pages/Login';
import { MyPage } from '../pages/MyPage';
import { RecommendationHistory } from '../pages/RecommendationHistory';
import { RegisterPage } from '../pages/Register';
import { OAuthKakaoRedirect } from '../pages/OAuthKakaoRedirect';
import { OAuthGoogleRedirect } from '../pages/OAuthGoogleRedirect';
import { MapPage } from '../pages/Map';
import ProtectedRoute from './ProtectedRoute';

// 라우트 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
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
    path: '/mypage',
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/recommendations/history',
    element: (
      <ProtectedRoute>
        <RecommendationHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: '/map',
    element: (
      <ProtectedRoute>
        <MapPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/oauth/kakao/redirect',
    element: <OAuthKakaoRedirect />,
  },
  {
    path: '/oauth/google/redirect',
    element: <OAuthGoogleRedirect />,
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}

