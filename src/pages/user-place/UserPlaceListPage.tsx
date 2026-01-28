/**
 * User Place 목록 페이지
 */

import { Button } from '@/components/common/Button';
import { UserPlaceList } from '@/components/features/user-place/UserPlaceList';
import { UserPlaceDetailModal } from '@/components/features/user-place/UserPlaceDetailModal';
import { UserPlaceDeleteConfirm } from '@/components/features/user-place/UserPlaceDeleteConfirm';
import { useUserPlaceList } from '@/hooks/user-place/useUserPlaceList';
import { useUserPlaceDetail } from '@/hooks/user-place/useUserPlaceDetail';
import { useUserPlaceActions } from '@/hooks/user-place/useUserPlaceActions';
import type { UserPlace } from '@/types/user-place';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    refreshList,
  } = useUserPlaceList();

  const { place: selectedPlace } = useUserPlaceDetail(selectedPlaceId);
  const { deletePlace, isDeleteLoading } = useUserPlaceActions();

  // 가게 클릭
  const handlePlaceClick = useCallback((place: UserPlace) => {
    setSelectedPlaceId(place.id);
  }, []);

  // 상세 모달 닫기
  const handleCloseDetail = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  // 수정 버튼 클릭
  const handleEditClick = useCallback(() => {
    if (selectedPlace) {
      navigate(`/user-places/${selectedPlace.id}/edit`);
    }
  }, [selectedPlace, navigate]);

  // 삭제 버튼 클릭
  const handleDeleteClick = useCallback(() => {
    if (selectedPlace) {
      setDeleteTarget(selectedPlace);
      setSelectedPlaceId(null);
    }
  }, [selectedPlace]);

  // 삭제 확인
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

  // 등록 페이지로 이동
  const handleCreateClick = useCallback(() => {
    navigate('/user-places/create');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t('userPlace.title')}
            </h1>
            <p className="mt-2 text-slate-400">
              {t('userPlace.subtitle', { count: total })}
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateClick}>
            {t('userPlace.addPlace')}
          </Button>
        </div>

        {/* 목록 */}
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

        {/* 상세 모달 */}
        <UserPlaceDetailModal
          open={!!selectedPlaceId && !!selectedPlace}
          place={selectedPlace}
          onClose={handleCloseDetail}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        {/* 삭제 확인 모달 */}
        <UserPlaceDeleteConfirm
          open={!!deleteTarget}
          place={deleteTarget}
          isDeleting={isDeleteLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </div>
  );
}
