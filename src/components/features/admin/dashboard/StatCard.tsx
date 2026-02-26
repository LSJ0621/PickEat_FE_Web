/**
 * 통계 카드 컴포넌트
 * 대시보드 상단에 표시되는 통계 정보 카드
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'warning' | 'danger';
}

export function StatCard({ title, value, icon: Icon, description, variant = 'default' }: StatCardProps) {
  const variantClasses = {
    default: 'border-[var(--border-default)]',
    warning: 'border-[var(--border-default)] bg-warning-bg',
    danger: 'border-[var(--border-default)] bg-error-bg',
  };

  const iconVariantClasses = {
    default: 'text-info',
    warning: 'text-warning',
    danger: 'text-error',
  };

  return (
    <Card className={cn('bg-bg-surface border', variantClasses[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconVariantClasses[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        {description && <p className="text-xs text-text-tertiary mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
