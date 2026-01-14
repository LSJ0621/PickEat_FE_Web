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
    default: 'border-slate-700',
    warning: 'border-yellow-600 bg-yellow-950/20',
    danger: 'border-red-600 bg-red-950/20',
  };

  const iconVariantClasses = {
    default: 'text-blue-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <Card className={cn('bg-slate-800 border', variantClasses[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconVariantClasses[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
