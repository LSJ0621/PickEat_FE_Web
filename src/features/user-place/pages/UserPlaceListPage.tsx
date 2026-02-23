/**
 * User Place 목록 페이지
 */

import { Button } from '@shared/components/Button';
import { DataErrorFallback } from '@shared/components/DataErrorFallback';
import { PageContainer } from '@shared/components/PageContainer';
import { PageHeader } from '@shared/components/PageHeader';
import { UserPlaceList } from '@features/user-place/components/UserPlaceList';
import { UserPlaceDetailModal } from '@features/user-place/components/UserPlaceDetailModal';
import { UserPlaceDeleteConfirm } from '@features/user-place/components/UserPlaceDeleteConfirm';
import { useUserPlaceList } from '@features/user-place/hooks/useUserPlaceList';
import { useUserPlaceDetail } from '@features/user-place/hooks/useUserPlaceDetail';
import { useUserPlaceActions } from '@features/user-place/hooks/useUserPlaceActions';
import type { UserPlace } from '@features/user-place/types';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function UserPlaceListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserPlace | null>(null);

  const {
    places,
    total,
    totalPages,
    page,
    status,
    search,
    isLoading,
    error,
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    refreshList,
  } = useUserPlaceList();

  const { place: selectedPlace } = useUserPlaceDetail(selectedPlaceId);
  const { deletePlace, isDeleteLoading } = useUserPlaceActions();

  const handlePlaceClick = useCallback((place: UserPlace) => {
    setSelectedPlaceId(place.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  const handleEditClick = useCallback(() => {
    if (selectedPlace) {
      navigate(`/user-places/${selectedPlace.id}/edit`);
    }
  }, [selectedPlace, navigate]);

  const handleDeleteClick = useCallback(() => {
    if (selectedPlace) {
      setDeleteTarget(selectedPlace);
      setSelectedPlaceId(null);
    }
  }, [selectedPlace]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deletePlace(deleteTarget.id);
      setDeleteTarget(null);
      refreshList();
    } catch {
      // 에러는 hook에서 처리
    }
  }, [deleteTarget, deletePlace, refreshList]);

  const handleCreateClick = useCallback(() => {
    navigate('/user-places/create');
  }, [navigate]);

  if (error && !isLoading) {
    return (
      <PageContainer maxWidth="max-w-7xl">
        <DataErrorFallback message={error} onRetry={refreshList} />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="max-w-7xl">
      <PageHeader
        title={t('userPlace.title')}
        subtitle={t('userPlace.subtitle', { count: total })}
        action={
          <Button variant="primary" onClick={handleCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t('userPlace.addPlace')}
          </Button>
        }
      />

      <UserPlaceList
        places={places}
        isLoading={isLoading}
        status={status}
        search={search}
        page={page}
        totalPages={totalPages}
        onStatusFilter={handleStatusFilter}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPlaceClick={handlePlaceClick}
      />

      <UserPlaceDetailModal
        open={!!selectedPlaceId && !!selectedPlace}
        place={selectedPlace}
        onClose={handleCloseDetail}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <UserPlaceDeleteConfirm
        open={!!deleteTarget}
        place={deleteTarget}
        isDeleting={isDeleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </PageContainer>
  );
}
