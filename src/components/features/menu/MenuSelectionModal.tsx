/**
 * 메뉴 선택 모달 컴포넌트
 * 추천받은 메뉴들 중에서 선택할 수 있는 다이얼로그
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { MenuSlot } from '@/types/menu';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MenuSelectionModalProps {
  open: boolean;
  recommendations: string[];
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
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [slot, setSlot] = useState<MenuSlot>('lunch');
  const { handleError, handleSuccess } = useErrorHandler();

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
      handleError('최소 하나의 메뉴를 선택해주세요.', 'MenuSelection');
      return;
    }

    if (!slot) {
      handleError('식사 시간을 선택해주세요.', 'MenuSelection');
      return;
    }

    setIsSaving(true);
    try {
      // 선택한 메뉴들을 slot과 함께 menus 배열로 구성
      const menus = Array.from(selectedMenus).map((name) => ({ slot, name }));

      await menuService.createMenuSelection({
        menus,
        historyId: historyId ?? undefined,
      });

      // 모달 닫을 때 선택 상태 초기화
      setSelectedMenus(new Set());
      
      handleSuccess('메뉴 선택이 완료되었습니다.');
      
      // Toast가 표시될 시간을 주기 위해 약간의 지연 후 모달 닫기
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

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div 
        className={`relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} />

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-white">메뉴 선택하기</h3>
            <p className="mt-1 text-sm text-slate-400">원하는 메뉴를 선택해주세요 (중복 선택 가능)</p>
          </div>

          {/* 식사 시간(slot) 선택 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-300">언제 먹을 메뉴인가요?</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { key: 'breakfast', label: '아침' },
                { key: 'lunch', label: '점심' },
                { key: 'dinner', label: '저녁' },
                { key: 'etc', label: '기타' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSlot(key as MenuSlot)}
                  className={`rounded-full px-3 py-1 font-medium transition ${
                    slot === key
                      ? 'bg-orange-500 text-white shadow shadow-orange-500/40'
                      : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto custom-scroll">
            {recommendations.map((menu, index) => {
              const isSelected = selectedMenus.has(menu);
              return (
                <button
                  key={index}
                  onClick={() => handleToggleMenu(menu)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-orange-400/60 bg-orange-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      data-testid={isSelected ? 'selected-indicator' : undefined}
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                        isSelected
                          ? 'border-orange-400 bg-orange-400'
                          : 'border-slate-400 bg-transparent'
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1 font-medium text-white">{menu}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" size="lg" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={selectedMenus.size === 0}
              className="flex-1"
            >
              선택 완료 ({selectedMenus.size}개)
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

