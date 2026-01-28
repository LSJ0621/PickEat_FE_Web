/**
 * User Place 수정 페이지
 */

import { Button } from '@/components/common/Button';
import { UserPlaceForm } from '@/components/features/user-place/UserPlaceForm';
import { PageLoadingFallback } from '@/components/common/PageLoadingFallback';
import { useUserPlaceDetail } from '@/hooks/user-place/useUserPlaceDetail';
import { useUserPlaceActions } from '@/hooks/user-place/useUserPlaceActions';
import type { CreateUserPlaceRequest, UpdateUserPlaceRequest } from '@/types/user-place';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export function UserPlaceEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const placeId = id ? parseInt(id, 10) : null;

  const { place, isLoading } = useUserPlaceDetail(placeId);
  const { updatePlace, isUpdateLoading } = useUserPlaceActions();

  // 폼 제출
  const handleFormSubmit = useCallback(
    async (data: CreateUserPlaceRequest | UpdateUserPlaceRequest) => {
      if (!placeId) return;

      // Type guard: UpdateUserPlaceRequest must have 'version' field
      // Since we're in edit mode and initialData exists, the form will include version
      const isUpdateRequest = (
        d: CreateUserPlaceRequest | UpdateUserPlaceRequest
      ): d is UpdateUserPlaceRequest => 'version' in d;

      if (!isUpdateRequest(data)) {
        console.error('Invalid update request: missing version field');
        return;
      }

      try {
        await updatePlace(placeId, data);
        navigate('/user-places');
      } catch {
        // 에러는 hook에서 처리
      }
    },
    [placeId, updatePlace, navigate]
  );

  // 취소
  const handleCancel = useCallback(() => {
    navigate('/user-places');
  }, [navigate]);

  // 로딩 중
  if (isLoading) {
    return <PageLoadingFallback />;
  }

  // 데이터 없음
  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur">
            <p className="mb-6 text-lg text-slate-300">
              {t('userPlace.notFound')}
            </p>
            <Button variant="primary" onClick={() => navigate('/user-places')}>
              {t('userPlace.goToList')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 수정 불가능한 상태
  if (place.status !== 'PENDING' && place.status !== 'REJECTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur">
            <p className="mb-6 text-lg text-slate-300">
              {t('userPlace.cannotEdit')}
            </p>
            <Button variant="primary" onClick={() => navigate('/user-places')}>
              {t('userPlace.goToList')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {t('userPlace.editTitle')}
          </h1>
          <p className="mt-2 text-slate-400">{t('userPlace.editSubtitle')}</p>
        </div>

        {/* 거절 사유 표시 */}
        {place.status === 'REJECTED' && place.rejectionReason && (
          <div className="mb-6 rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 backdrop-blur">
            <h3 className="mb-2 text-sm font-semibold text-red-300">
              {t('userPlace.rejectionReason')}
            </h3>
            <p className="text-red-200">{place.rejectionReason}</p>
          </div>
        )}

        {/* 폼 */}
        <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-8 backdrop-blur">
          <UserPlaceForm
            initialData={place}
            onSubmit={(data) => void handleFormSubmit(data)}
            onCancel={handleCancel}
            isLoading={isUpdateLoading}
            submitLabel={t('common.save')}
          />
        </div>
      </div>
    </div>
  );
}
