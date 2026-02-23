/**
 * 일반 사용자 전용 보호 라우트 컴포넌트
 * 인증된 비관리자 사용자만 접근 가능합니다.
 * 미인증 → /login, 관리자 → /admin/dashboard 리다이렉트
 */

import { PageLoadingFallback } from '@/components/common/PageLoadingFallback';
import { useAppSelector } from '@/store/hooks';
import { isAdminRole } from '@/utils/role';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserOnlyRouteProps {
  children: React.ReactNode;
}

export default function UserOnlyRoute({ children }: UserOnlyRouteProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { redirectTo: window.location.pathname } });
      return;
    }

    if (isAdminRole(userRole)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  if (!isAuthenticated || isAdminRole(userRole)) {
    return <PageLoadingFallback />;
  }

  return <>{children}</>;
}
