/**
 * 관리자 권한 보호 라우트 컴포넌트
 * ADMIN, SUPER_ADMIN 권한이 필요한 페이지를 보호합니다.
 * 권한이 없는 사용자는 홈으로 리다이렉트됩니다.
 */

import { useAppSelector } from '@app/store/hooks';
import { isAdminRole } from '@shared/utils/role';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { redirectTo: window.location.pathname } });
      return;
    }

    if (!isAdminRole(userRole)) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  if (!isAuthenticated || !isAdminRole(userRole)) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
}
