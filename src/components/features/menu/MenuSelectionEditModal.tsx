/**
 * 메뉴 선택 수정 모달 컴포넌트
 * 메뉴 선택 이력에서 수정할 때 사용하는 다이얼로그
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { MenuSlot, UpdateMenuSelectionRequest } from '@/types/menu';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [availableMenus, setAvailableMenus] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);
  const prevOpenRef = useRef(false);
  const { handleError, handleSuccess } = useErrorHandler();

  const loadRecommendationMenus = useCallback(async () => {
    setIsLoadingMenus(true);
    try {
      // historyId로 추천 이력 조회
      const result = await menuService.getPlaceRecommendationsByHistoryId(historyId!);
      
      // history의 type이 'MENU'인 경우, places에서 menuName을 추출
      // 또는 메뉴 추천 목록을 직접 가져올 수 있다면 그걸 사용
      if (result.history.type === 'MENU') {
        // places에서 menuName 추출
        const menuNames = Array.from(
          new Set(result.places.map((place) => place.menuName).filter((name): name is string => !!name))
        );
        // 메뉴 목록이 있으면 사용, 없으면 현재 선택된 메뉴들 사용
        setAvailableMenus(menuNames.length > 0 ? menuNames : currentMenuNames);
      } else {
        // PLACE 타입이면 현재 선택된 메뉴들 사용
        setAvailableMenus(currentMenuNames);
      }
      // 현재 선택된 메뉴들을 초기 선택으로 설정
      setSelectedMenus(new Set(currentMenuNames));
    } catch {
      // 실패 시 현재 선택된 메뉴들을 기본 목록으로 사용
      setAvailableMenus(currentMenuNames);
      setSelectedMenus(new Set(currentMenuNames));
    } finally {
      setIsLoadingMenus(false);
    }
  }, [historyId, currentMenuNames]);

  // 모달이 열릴 때 추천 메뉴 목록 가져오기
  useEffect(() => {
    // 모달이 닫혔다가 다시 열릴 때만 초기화
    if (prevOpenRef.current && !open) {
      hasLoadedRef.current = false;
    }
    prevOpenRef.current = open;

    if (!open) {
      return;
    }

    // StrictMode 대응: 이미 로드했으면 스킵
    if (hasLoadedRef.current) {
      return;
    }

    if (historyId) {
      hasLoadedRef.current = true;
      loadRecommendationMenus();
    } else {
      // historyId가 없으면 현재 선택된 메뉴들을 기본 목록으로 사용
      hasLoadedRef.current = true;
      setAvailableMenus(currentMenuNames);
      setSelectedMenus(new Set(currentMenuNames));
    }
  }, [open, historyId, currentMenuNames, loadRecommendationMenus]);

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
      handleError('최소 하나의 메뉴를 선택해주세요.', 'MenuSelectionEdit');
      return;
    }

    setIsSaving(true);
    try {
      // 선택한 메뉴들을 배열로 변환
      const selectedMenuArray = Array.from(selectedMenus);

      // PATCH 요청: slot별 배열로 업데이트 (해당 slot 전체 덮어쓰기)
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
      handleSuccess('메뉴 선택이 수정되었습니다.');
      onComplete();
      onClose();
      // 모달 닫을 때 선택 상태 초기화
      setSelectedMenus(new Set());
    } catch (error) {
      handleError(error, 'MenuSelectionEdit');
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
            <h3 className="text-xl font-semibold text-white">메뉴 수정하기</h3>
            <p className="mt-1 text-sm text-slate-400">원하는 메뉴를 선택해주세요 (중복 선택 가능)</p>
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
              <div className="max-h-96 space-y-2 overflow-y-auto custom-scroll">
                {availableMenus.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">선택 가능한 메뉴가 없습니다.</p>
                ) : (
                  availableMenus.map((menu, index) => {
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
                  })
                )}
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
                  수정 완료 ({selectedMenus.size}개)
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

