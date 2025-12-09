/**
 * 이력 메뉴 액션 관련 Custom Hook
 * 메뉴 선택 및 검색 로직을 관리합니다.
 */

import { searchService } from '@/api/services/search';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAppSelector } from '@/store/hooks';
import type { Restaurant } from '@/types/search';
import { useCallback, useState } from 'react';

interface UseHistoryMenuActionsReturn {
  selectedMenu: string | null;
  showConfirmCard: boolean;
  restaurants: Restaurant[];
  loading: boolean;
  handleMenuClick: (menu: string) => void;
  handleSearch: () => Promise<void>;
  handleCancel: () => void;
  resetSearchResults: () => void;
}

/**
 * 이력 메뉴 액션 관련 로직을 관리하는 Custom Hook
 */
export const useHistoryMenuActions = (): UseHistoryMenuActionsReturn => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, hasLocation } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const handleMenuClick = useCallback((menu: string) => {
    const isSameMenu = selectedMenu === menu;
    setSelectedMenu(menu);
    setShowConfirmCard(true);
    if (!isSameMenu) {
      setRestaurants([]);
    }
  }, [selectedMenu]);

  const handleSearch = useCallback(async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      alert('위치 정보가 없습니다. 주소를 등록해주세요.');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    setShowConfirmCard(false);
    setLoading(true);
    try {
      const result = await searchService.restaurants({
        menuName: selectedMenu,
        latitude,
        longitude,
        includeRoadAddress: false,
      });
      setRestaurants(result.restaurants);
    } catch (error) {
      console.error('식당 검색 실패:', error);
      alert('식당 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, hasLocation, latitude, longitude, selectedMenu]);

  const handleCancel = useCallback(() => {
    setShowConfirmCard(false);
  }, []);

  const resetSearchResults = useCallback(() => {
    setRestaurants([]);
  }, []);

  return {
    selectedMenu,
    showConfirmCard,
    restaurants,
    loading,
    handleMenuClick,
    handleSearch,
    handleCancel,
    resetSearchResults,
  };
};

