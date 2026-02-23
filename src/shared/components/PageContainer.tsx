/**
 * PageContainer - 공통 페이지 래퍼 컴포넌트
 * 반복되는 gradient 배경 + 페이지 래퍼를 공통화합니다.
 *
 * Usage:
 * <PageContainer>
 *   <PageHeader title="마이페이지" />
 *   ...content
 * </PageContainer>
 *
 * <PageContainer maxWidth="max-w-6xl" className="pb-10">
 *   ...content
 * </PageContainer>
 */

import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** 추가 className (선택) */
  className?: string;
  /** 최대 너비 Tailwind 클래스 (기본: 'max-w-4xl') */
  maxWidth?: string;
}

export function PageContainer({
  children,
  className = '',
  maxWidth = 'max-w-4xl',
}: PageContainerProps) {
  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-300/20 via-orange-200/10 to-amber-100/5 blur-3xl" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-orange-200/10 via-amber-100/5 to-transparent blur-3xl" />
      </div>

      {/* Page content */}
      <div
        className={[
          'relative z-10 mx-auto w-full',
          maxWidth,
          'px-4 py-8 pb-28 sm:px-6 sm:py-10 lg:px-8',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
