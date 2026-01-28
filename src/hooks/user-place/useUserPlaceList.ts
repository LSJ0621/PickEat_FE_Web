/**
 * User Place 목록 관리 Custom Hook
 * 페이지네이션, 필터링, 검색 기능을 제공합니다.
 */

import { userPlaceService } from '@/api/services/user-place';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { UserPlace, UserPlaceStatus } from '@/types/user-place';
import { useCallback, useEffect, useState } from 'react';

export const useUserPlaceList = () => {
  const { handleError } = useErrorHandler();
  const [places, setPlaces] = useState<UserPlace[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<UserPlaceStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 목록 로드
  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await userPlaceService.getUserPlaces({
        page,
        limit,
        status,
        search: search || undefined,
      });
      setPlaces(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: unknown) {
      handleError(error, 'useUserPlaceList');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status, search, handleError]);

  // 페이지/필터 변경 시 재로드
  useEffect(() => {
    loadPlaces().catch((error) => {
      // 이미 hook에서 처리되지만 디버깅을 위해 로깅
      console.error('Failed to load user places:', error);
    });
  }, [loadPlaces]);

  // 페이지 변경
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // 필터 변경
  const handleStatusFilter = useCallback((newStatus: UserPlaceStatus | undefined) => {
    setStatus(newStatus);
    setPage(1); // 필터 변경 시 첫 페이지로
  }, []);

  // 검색어 변경
  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // 검색 시 첫 페이지로
  }, []);

  // 목록 새로고침
  const refreshList = useCallback(() => {
    loadPlaces().catch((error) => {
      console.error('Failed to refresh user places:', error);
    });
  }, [loadPlaces]);

  return {
    // 데이터
    places,
    total,
    totalPages,
    // 상태
    page,
    limit,
    status,
    search,
    isLoading,
    // 함수
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    refreshList,
  };
};
