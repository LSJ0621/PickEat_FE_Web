/**
 * 전역 레이아웃 컴포넌트
 * 모든 페이지에 헤더와 푸터를 자동으로 적용합니다.
 */

import { AppFooter } from '@/components/common/AppFooter';
import { AppHeader } from '@/components/common/AppHeader';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const AppLayout = ({ children, showHeader = true, showFooter = true }: AppLayoutProps) => {
  return (
    <>
      {showHeader && <AppHeader />}
      {children}
      {showFooter && <AppFooter />}
    </>
  );
};

