/**
 * 메뉴 선택 모달 컴포넌트
 * 추천받은 메뉴들 중에서 선택할 수 있는 다이얼로그
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { MenuRecommendationItemData, MenuSlot } from '@/types/menu';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { Z_INDEX } from '@/utils/constants';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface MenuSelectionModalProps {
  open: boolean;
  recommendations: MenuRecommendationItemData[];
  historyId: number | null;
  onClose: () => void;
  onComplete: () => void;
}

export const MenuSelectionModal = ({
  open,
  recommendations,
  historyId,
  onClose,
  onComplete,
}: MenuSelectionModalProps) => {
  const { t } = useTranslation();
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [slot, setSlot] = useState<MenuSlot>('lunch');
  const { handleError, handleSuccess } = useErrorHandler();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

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
      handleError(t('menu.selectAtLeastOne'), 'MenuSelection');
      return;
    }

    if (!slot) {
      handleError(t('menu.selectMealTime'), 'MenuSelection');
      return;
    }

    setIsSaving(true);
    try {
      const menus = Array.from(selectedMenus).map((name) => ({ slot, name }));

      await menuService.createMenuSelection({
        menus,
        historyId: historyId ?? undefined,
      });

      setSelectedMenus(new Set());
      handleSuccess(t('menu.selectionComplete'));

      setTimeout(() => {
        onComplete();
        onClose();
      }, 100);
    } catch (error) {
      handleError(error, 'MenuSelection');
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
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="menu-selection-modal"
        className={`relative w-full max-w-md rounded-t-2xl md:rounded-2xl border border-border-default bg-bg-surface p-6 shadow-2xl ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
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
            <h3 className="text-xl font-semibold text-text-primary">{t('menu.selectMenu')}</h3>
            <p className="mt-1 text-sm text-text-tertiary">{t('menu.selectMenusPlural')}</p>
          </div>

          {/* 식사 시간(slot) 선택 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">{t('menu.whenToEat')}</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { key: 'breakfast', label: t('menu.breakfast') },
                { key: 'lunch', label: t('menu.lunch') },
                { key: 'dinner', label: t('menu.dinner') },
                { key: 'etc', label: t('menu.etc') },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSlot(key as MenuSlot)}
                  className={`rounded-full px-3 py-1.5 font-medium transition-all duration-150 ${
                    slot === key
                      ? 'bg-brand-primary text-text-inverse shadow shadow-brand-primary/40'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto custom-scroll">
            {recommendations.map((item, index) => {
              const isSelected = selectedMenus.has(item.menu);
              return (
                <button
                  key={index}
                  onClick={() => handleToggleMenu(item.menu)}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-primary/60 bg-brand-primary/10'
                      : 'border-border-default bg-bg-surface hover:border-border-focus/40 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      data-testid={isSelected ? 'selected-indicator' : undefined}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-150 ${
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
                    <div className="flex-1">
                      <span className="font-medium text-text-primary" data-testid="selected-menu-name">
                        {item.menu}
                      </span>
                      <p className="mt-1 text-xs text-text-tertiary">{item.condition}</p>
                    </div>
                  </div>
                </button>
              );
            })}
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
              {t('menu.selectionCompleteWithCount', { count: selectedMenus.size })}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
