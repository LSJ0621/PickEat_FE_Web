/**
 * PageHeader - 페이지 타이틀 + 부제목 + 우측 액션 영역 컴포넌트
 *
 * Usage:
 * <PageHeader title="마이페이지" subtitle="프로필 및 설정" />
 *
 * <PageHeader
 *   title="히스토리"
 *   subtitle="지난 추천 내역을 확인하세요"
 *   action={<Button size="sm">내보내기</Button>}
 * />
 */

import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** 우측 액션 영역 (버튼, 필터 등) */
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div
      className={`mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary sm:text-base">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      )}
    </div>
  );
}
