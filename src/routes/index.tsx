/**
 * 라우팅 설정
 * 모든 라우트를 한 곳에서 관리합니다.
 */

import { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/Home';
import { AgentPage } from '../pages/Agent';
import { LoginPage } from '../pages/Login';
import { MyPage } from '../pages/MyPage';
import { RecommendationHistory } from '../pages/RecommendationHistory';
import { RegisterPage } from '../pages/Register';
import { OAuthKakaoRedirect } from '../pages/OAuthKakaoRedirect';
import { OAuthGoogleRedirect } from '../pages/OAuthGoogleRedirect';
import { MapPage } from '../pages/Map';
import ProtectedRoute from './ProtectedRoute';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

// 라우트 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/agent',
    element: (
      <ProtectedRoute>
        <AgentPage />
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
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    dispatch(initializeAuth());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

