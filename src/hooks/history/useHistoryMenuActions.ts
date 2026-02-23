/**
 * 이력 메뉴 액션 관련 Custom Hook
 * 메뉴 선택 로직을 관리합니다.
 */

import { useCallback, useState } from 'react';

interface UseHistoryMenuActionsReturn {
  selectedMenu: string | null;
  showConfirmCard: boolean;
  handleMenuClick: (menu: string) => void;
  handleCancel: () => void;
}

/**
 * 이력 메뉴 액션 관련 로직을 관리하는 Custom Hook
 */
export const useHistoryMenuActions = (): UseHistoryMenuActionsReturn => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showConfirmCard, setShowConfirmCard] = useState(false);

  const handleMenuClick = useCallback((menu: string) => {
    setSelectedMenu(menu);
    setShowConfirmCard(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowConfirmCard(false);
  }, []);

  return {
    selectedMenu,
    showConfirmCard,
    handleMenuClick,
    handleCancel,
  };
};
