/**
 * 메뉴 선택 수정 모달 컴포넌트
 * 메뉴 선택 이력에서 수정할 때 사용하는 다이얼로그
 */

import { menuService } from '@features/agent/api';
import { Button } from '@shared/components/Button';
import { ModalCloseButton } from '@shared/components/ModalCloseButton';
import type { MenuSlot, UpdateMenuSelectionRequest } from '@features/agent/types';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { Z_INDEX } from '@shared/utils/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface MenuSelectionEditModalProps {
  open: boolean;
  selectionId: number;
  currentMenuNames: string[];
  historyId: number | null | undefined;
  slot: MenuSlot;
  onClose: () => void;
  onComplete: () => void;
}

export const MenuSelectionEditModal = ({
  open,
  selectionId,
  currentMenuNames,
  historyId,
  slot,
  onClose,
  onComplete,
}: MenuSelectionEditModalProps) => {
  const { t } = useTranslation();
  const [availableMenus, setAvailableMenus] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);
  const prevOpenRef = useRef(false);
  const { handleError, handleSuccess } = useErrorHandler();
  const { isAnimating, shouldRender, isClosing } = useModalAnimation(open);
  useModalScrollLock(open);

  const loadRecommendationMenus = useCallback(async () => {
    setIsLoadingMenus(true);
    try {
      const result = await menuService.getPlaceRecommendationsByHistoryId(historyId!);

      if (result.history.type === 'MENU') {
        const menuNames = Array.from(
          new Set(result.places.map((place) => place.menuName).filter((name): name is string => !!name))
        );
        setAvailableMenus(menuNames.length > 0 ? menuNames : currentMenuNames);
      } else {
        setAvailableMenus(currentMenuNames);
      }
      setSelectedMenus(new Set(currentMenuNames));
    } catch {
      setAvailableMenus(currentMenuNames);
      setSelectedMenus(new Set(currentMenuNames));
    } finally {
      setIsLoadingMenus(false);
    }
  }, [historyId, currentMenuNames]);

  // 모달이 열릴 때 추천 메뉴 목록 가져오기
  useEffect(() => {
    if (prevOpenRef.current && !open) {
      hasLoadedRef.current = false;
    }
    prevOpenRef.current = open;

    if (!open) return;
    if (hasLoadedRef.current) return;

    if (historyId) {
      hasLoadedRef.current = true;
      loadRecommendationMenus();
    } else {
      hasLoadedRef.current = true;
      setAvailableMenus(currentMenuNames);
      setSelectedMenus(new Set(currentMenuNames));
    }
  }, [open, historyId, currentMenuNames, loadRecommendationMenus]);

  useEscapeKey(onClose, open);

  const handleToggleMenu = (menu: string) => {
    setSelectedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menu)) {
        next.delete(menu);
      } else {
        next.add(menu);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedMenus.size === 0) {
      handleError(t('menu.selectAtLeastOne'), 'MenuSelectionEdit');
      return;
    }

    setIsSaving(true);
    try {
      const selectedMenuArray = Array.from(selectedMenus);
      const requestData: UpdateMenuSelectionRequest = {};

      if (slot === 'breakfast') {
        requestData.breakfast = selectedMenuArray;
      } else if (slot === 'lunch') {
        requestData.lunch = selectedMenuArray;
      } else if (slot === 'dinner') {
        requestData.dinner = selectedMenuArray;
      } else if (slot === 'etc') {
        requestData.etc = selectedMenuArray;
      }
      await menuService.updateMenuSelection(selectionId, requestData);
      handleSuccess(t('menu.menuSelectionUpdated'));
      onComplete();
      onClose();
      setSelectedMenus(new Set());
    } catch (error) {
      handleError(error, 'MenuSelectionEdit');
    } finally {
      setIsSaving(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : isClosing ? 'modal-backdrop-exit' : 'opacity-0'
      }`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-md rounded-t-2xl md:rounded-2xl border border-border-default bg-bg-surface p-6 shadow-2xl ${
          isAnimating ? 'modal-content-enter' : isClosing ? 'modal-content-exit' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClose={onClose} />

        <div className="space-y-4">
          {/* Mobile handle */}
          <div className="flex justify-center pb-2 md:hidden">
            <div className="h-1 w-12 rounded-full bg-border-default" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-text-primary">{t('menu.editMenu')}</h3>
            <p className="mt-1 text-sm text-text-tertiary">{t('menu.selectMenusPlural')}</p>
          </div>

          {isLoadingMenus ? (
            <div className="flex items-center justify-center py-8">
              <div
                data-testid="loading-spinner"
                className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"
              />
            </div>
          ) : (
            <>
              <div className="max-h-72 space-y-2 overflow-y-auto custom-scroll">
                {availableMenus.length === 0 ? (
                  <p className="py-8 text-center text-text-tertiary">{t('menu.noAvailableMenus')}</p>
                ) : (
                  availableMenus.map((menu, index) => {
                    const isSelected = selectedMenus.has(menu);
                    return (
                      <button
                        key={index}
                        onClick={() => handleToggleMenu(menu)}
                        className={`w-full rounded-xl border p-4 text-left transition-all duration-150 ${
                          isSelected
                            ? 'border-brand-primary/60 bg-brand-primary/10'
                            : 'border-border-default bg-bg-surface hover:border-border-focus/40 hover:bg-bg-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            data-testid={isSelected ? 'selected-indicator' : undefined}
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-150 ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-border-default bg-transparent'
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 font-medium text-text-primary">{menu}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="ghost" size="lg" onClick={onClose} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={selectedMenus.size === 0}
                  className="flex-1"
                >
                  {t('menu.editCompleteWithCount', { count: selectedMenus.size })}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
