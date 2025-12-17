/**
 * 보호된 라우트 컴포넌트
 * 인증이 필요한 페이지를 보호합니다.
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */

import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { redirectTo: window.location.pathname } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
}

