/**
 * User Place 목록 관리 Custom Hook
 * 페이지네이션, 필터링, 검색 기능을 제공합니다.
 */

import { userPlaceService } from '@features/user-place/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import type { UserPlace, UserPlaceStatus } from '@features/user-place/types';
import { extractErrorMessage } from '@shared/utils/error';
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
  const [error, setError] = useState<string | null>(null);

  // 목록 로드
  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '장소 목록을 불러오지 못했습니다');
      setError(message);
      handleError(err, 'useUserPlaceList');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status, search, handleError]);

  // 페이지/필터 변경 시 재로드
  useEffect(() => {
    void loadPlaces();
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
    void loadPlaces();
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
    error,
    // 함수
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    refreshList,
  };
};
