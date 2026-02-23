/**
 * User Place 수정 페이지
 */

import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { UserPlaceForm } from '@/components/features/user-place/UserPlaceForm';
import { PageLoadingFallback } from '@/components/common/PageLoadingFallback';
import { useUserPlaceDetail } from '@/hooks/user-place/useUserPlaceDetail';
import { useUserPlaceActions } from '@/hooks/user-place/useUserPlaceActions';
import type { CreateUserPlaceRequest, UpdateUserPlaceRequest } from '@/types/user-place';
import { AlertCircle } from 'lucide-react';
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

  const handleFormSubmit = useCallback(
    async (data: CreateUserPlaceRequest | UpdateUserPlaceRequest) => {
      if (!placeId) return;

      const isUpdateRequest = (
        d: CreateUserPlaceRequest | UpdateUserPlaceRequest
      ): d is UpdateUserPlaceRequest => 'version' in d;

      if (!isUpdateRequest(data)) {
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

  const handleCancel = useCallback(() => {
    navigate('/user-places');
  }, [navigate]);

  if (isLoading) {
    return <PageLoadingFallback />;
  }

  if (!place) {
    return (
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default bg-bg-surface p-10 text-center shadow-lg shadow-black/10">
          <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
          <p className="mb-6 text-base text-text-secondary">{t('userPlace.notFound')}</p>
          <Button variant="primary" onClick={() => navigate('/user-places')}>
            {t('userPlace.goToList')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (place.status !== 'PENDING' && place.status !== 'REJECTED') {
    return (
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default bg-bg-surface p-10 text-center shadow-lg shadow-black/10">
          <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
          <p className="mb-6 text-base text-text-secondary">{t('userPlace.cannotEdit')}</p>
          <Button variant="primary" onClick={() => navigate('/user-places')}>
            {t('userPlace.goToList')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="max-w-2xl">
      <PageHeader
        title={t('userPlace.editTitle')}
        subtitle={t('userPlace.editSubtitle')}
      />

      {/* 거절 사유 */}
      {place.status === 'REJECTED' && place.rejectionReason && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <p className="mb-1.5 text-sm font-semibold text-red-500">
            {t('userPlace.rejectionReason')}
          </p>
          <p className="text-sm text-red-400">{place.rejectionReason}</p>
        </div>
      )}

      {/* 폼 */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg shadow-black/10 sm:p-8">
        <UserPlaceForm
          initialData={place}
          onSubmit={(data) => void handleFormSubmit(data)}
          onCancel={handleCancel}
          isLoading={isUpdateLoading}
          submitLabel={t('common.save')}
        />
      </div>
    </PageContainer>
  );
}
