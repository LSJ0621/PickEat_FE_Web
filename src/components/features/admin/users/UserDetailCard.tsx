/**
 * 사용자 기본 정보 카드 컴포넌트
 */

import type { AdminUserDetail } from '@/types/admin';
import { Mail, User, Calendar, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

interface UserDetailCardProps {
  user: AdminUserDetail;
  onDeactivate: () => void;
  onActivate: () => void;
  isProcessing: boolean;
}

export const UserDetailCard = ({
  user,
  onDeactivate,
  onActivate,
  isProcessing,
}: UserDetailCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSocialTypeBadge = (socialType: AdminUserDetail['socialType']) => {
    if (!socialType) return <span className="text-text-tertiary">없음</span>;

    const badges = {
      EMAIL: { bg: 'bg-info-bg', text: 'text-info', label: 'EMAIL' },
      KAKAO: { bg: 'bg-warning-bg', text: 'text-warning', label: 'KAKAO' },
      GOOGLE: { bg: 'bg-error-bg', text: 'text-error', label: 'GOOGLE' },
    };

    const badge = badges[socialType];
    return (
      <span className={`rounded-full ${badge.bg} px-3 py-1 text-sm font-medium ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusInfo = () => {
    if (user.deletedAt) {
      return {
        icon: <XCircle className="h-5 w-5 text-error" />,
        label: '탈퇴',
        color: 'text-error',
        date: formatDate(user.deletedAt),
      };
    }
    if (user.isDeactivated) {
      return {
        icon: <ShieldAlert className="h-5 w-5 text-brand-primary" />,
        label: '비활성화',
        color: 'text-brand-primary',
        date: null,
      };
    }
    return {
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      label: '활성',
      color: 'text-success',
      date: null,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-bg-surface p-6">
      <h2 className="mb-6 text-xl font-bold text-text-primary">기본 정보</h2>

      <div className="space-y-4">
        {/* 이메일 */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-text-tertiary mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-text-tertiary">이메일</div>
            <div className="text-text-primary">{user.email}</div>
          </div>
        </div>

        {/* 이름 */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-text-tertiary mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-text-tertiary">이름</div>
            <div className="text-text-primary">{user.name || '-'}</div>
          </div>
        </div>

        {/* 가입 유형 */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-text-tertiary mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-text-tertiary">가입 유형</div>
            <div className="mt-1">{getSocialTypeBadge(user.socialType)}</div>
          </div>
        </div>

        {/* 가입일 */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-text-tertiary mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-text-tertiary">가입일</div>
            <div className="text-text-primary">{formatDate(user.createdAt)}</div>
          </div>
        </div>

        {/* 이메일 인증 */}
        <div className="flex items-start gap-3">
          {user.emailVerified ? (
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-error mt-0.5" />
          )}
          <div className="flex-1">
            <div className="text-sm text-text-tertiary">이메일 인증</div>
            <div className={user.emailVerified ? 'text-success' : 'text-error'}>
              {user.emailVerified ? '인증 완료' : '미인증'}
            </div>
          </div>
        </div>

        {/* 상태 */}
        <div className="flex items-start gap-3">
          {statusInfo.icon}
          <div className="flex-1">
            <div className="text-sm text-text-tertiary">상태</div>
            <div className={statusInfo.color}>
              {statusInfo.label}
              {statusInfo.date && <span className="text-text-placeholder ml-2">({statusInfo.date})</span>}
            </div>
          </div>
        </div>

        {/* 비활성화/활성화 버튼 */}
        {!user.deletedAt && (
          <div className="pt-4 border-t border-[var(--border-default)]">
            {user.isDeactivated ? (
              <button
                onClick={onActivate}
                disabled={isProcessing}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-text-primary transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '처리 중...' : '활성화'}
              </button>
            ) : (
              <button
                onClick={onDeactivate}
                disabled={isProcessing}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-text-primary transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '처리 중...' : '비활성화'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
