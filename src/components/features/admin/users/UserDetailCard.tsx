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
    if (!socialType) return <span className="text-slate-400">없음</span>;

    const badges = {
      EMAIL: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'EMAIL' },
      KAKAO: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'KAKAO' },
      GOOGLE: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'GOOGLE' },
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
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        label: '탈퇴',
        color: 'text-red-400',
        date: formatDate(user.deletedAt),
      };
    }
    if (user.isDeactivated) {
      return {
        icon: <ShieldAlert className="h-5 w-5 text-orange-400" />,
        label: '비활성화',
        color: 'text-orange-400',
        date: null,
      };
    }
    return {
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      label: '활성',
      color: 'text-green-400',
      date: null,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">기본 정보</h2>

      <div className="space-y-4">
        {/* 이메일 */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-slate-400">이메일</div>
            <div className="text-white">{user.email}</div>
          </div>
        </div>

        {/* 이름 */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-slate-400">이름</div>
            <div className="text-white">{user.name || '-'}</div>
          </div>
        </div>

        {/* 가입 유형 */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-slate-400">가입 유형</div>
            <div className="mt-1">{getSocialTypeBadge(user.socialType)}</div>
          </div>
        </div>

        {/* 가입일 */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-slate-400">가입일</div>
            <div className="text-white">{formatDate(user.createdAt)}</div>
          </div>
        </div>

        {/* 이메일 인증 */}
        <div className="flex items-start gap-3">
          {user.emailVerified ? (
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="text-sm text-slate-400">이메일 인증</div>
            <div className={user.emailVerified ? 'text-green-400' : 'text-red-400'}>
              {user.emailVerified ? '인증 완료' : '미인증'}
            </div>
          </div>
        </div>

        {/* 상태 */}
        <div className="flex items-start gap-3">
          {statusInfo.icon}
          <div className="flex-1">
            <div className="text-sm text-slate-400">상태</div>
            <div className={statusInfo.color}>
              {statusInfo.label}
              {statusInfo.date && <span className="text-slate-500 ml-2">({statusInfo.date})</span>}
            </div>
          </div>
        </div>

        {/* 비활성화/활성화 버튼 */}
        {!user.deletedAt && (
          <div className="pt-4 border-t border-slate-700">
            {user.isDeactivated ? (
              <button
                onClick={onActivate}
                disabled={isProcessing}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '처리 중...' : '활성화'}
              </button>
            ) : (
              <button
                onClick={onDeactivate}
                disabled={isProcessing}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
