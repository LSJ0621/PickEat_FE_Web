/**
 * 관리자 설정 페이지
 * 관리자 계정 관리 (목록/추가/삭제)
 */

import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { AdminTab } from '@/components/features/admin/settings';
import { useAppSelector } from '@/store/hooks';

export function AdminSettingsPage() {
  const user = useAppSelector((state) => state.auth?.user);
  const userRole = user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // 현재 사용자 ID 추출 (User 타입에는 id가 없으므로 undefined)
  // TODO: Backend에서 /auth/me API가 user id를 반환하도록 수정하거나, JWT에 userId를 포함하도록 수정 필요
  const currentUserId = undefined;

  // SUPER_ADMIN이 아니면 접근 불가 메시지 표시
  if (!isSuperAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4 text-text-primary">
        <AdminPageBackground />
        <div className="relative z-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">접근 권한 없음</h1>
          <p className="text-text-tertiary">이 페이지는 슈퍼 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-bg-primary px-4 pt-20 pb-10 text-text-primary">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">관리자 계정 관리</h1>
          <p className="text-text-tertiary">관리자 계정을 추가하거나 제거할 수 있습니다.</p>
        </div>

        {/* 관리자 계정 관리 */}
        <AdminTab currentUserId={currentUserId} />
      </div>
    </div>
  );
}
