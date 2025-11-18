/**
 * 보호된 라우트 컴포넌트
 * 인증이 필요한 페이지를 보호합니다.
 * 로그인하지 않은 상태에서도 홈 화면에 접근할 수 있도록 허용합니다.
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // 로그인하지 않은 상태에서도 홈 화면에 접근 가능
  // HomePage 컴포넌트 내부에서 로그인 상태에 따라 다른 UI를 보여줌
  return <>{children}</>;
}

