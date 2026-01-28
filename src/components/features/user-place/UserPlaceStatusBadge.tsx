/**
 * User Place 상태 배지 컴포넌트
 */

import type { UserPlaceStatus } from '@/types/user-place';
import { useTranslation } from 'react-i18next';

interface UserPlaceStatusBadgeProps {
  status: UserPlaceStatus;
}

export function UserPlaceStatusBadge({ status }: UserPlaceStatusBadgeProps) {
  const { t } = useTranslation();

  const statusConfig = {
    PENDING: {
      label: t('userPlace.status.PENDING'),
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
    APPROVED: {
      label: t('userPlace.status.APPROVED'),
      className: 'bg-green-500/20 text-green-300 border-green-500/30',
    },
    REJECTED: {
      label: t('userPlace.status.REJECTED'),
      className: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
