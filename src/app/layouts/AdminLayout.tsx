/**
 * 관리자 페이지 레이아웃
 * AppLayout과 함께 사용되어 Header/Footer 사이에 사이드바와 콘텐츠를 표시
 */

import { AdminSidebar } from '@app/layouts/AdminSidebar';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-1 bg-bg-primary">
      {/* 사이드바 */}
      <AdminSidebar />

      {/* 페이지 컨텐츠 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
