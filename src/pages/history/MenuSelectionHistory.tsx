/**
 * 메뉴 선택 이력 페이지
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { MenuPayload, MenuSelection, MenuSlot } from '@/types/menu';
import { formatDateKorean } from '@/utils/format';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const MenuSelectionHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError, handleSuccess } = useErrorHandler();
  const [selections, setSelections] = useState<MenuSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [editingSelectionId, setEditingSelectionId] = useState<number | null>(null);
  const [editingPayload, setEditingPayload] = useState<MenuPayload | null>(null);

  // 초기 마운트 여부 추적 (StrictMode 대응)
  const hasInitializedRef = useRef(false);
  const prevSelectedDateRef = useRef<string>('');
  const currentPathnameRef = useRef<string>(location.pathname);

  // loadSelections를 useCallback으로 안정화 (다른 곳에서도 사용되므로)
  const loadSelections = useCallback(async () => {
    setLoading(true);
    try {
      const result = await menuService.getMenuSelections(selectedDate || undefined);
      // 취소된 메뉴(status가 CANCELLED이거나, 모든 slot이 비어있는 경우)는 프론트에서 필터링
      setSelections(
        result.selections.filter((s) => {
          const { breakfast, lunch, dinner, etc } = s.menuPayload;
          const allMenus = [...breakfast, ...lunch, ...dinner, ...etc];
          return allMenus.some((name) => name.trim() !== '');
        })
      );
    } catch (error: unknown) {
      handleError(error, 'MenuSelectionHistory');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // 경로 변경 감지 및 초기화 리셋 (컴포넌트 재사용 시 대비)
  useEffect(() => {
    if (currentPathnameRef.current !== location.pathname) {
      hasInitializedRef.current = false;
      prevSelectedDateRef.current = '';
      currentPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

  // 데이터 로드 (StrictMode 대응)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // StrictMode 대응: selectedDate가 변경되지 않았고 이미 초기화했으면 스킵
    const isDateChanged = prevSelectedDateRef.current !== selectedDate;
    if (!isDateChanged && hasInitializedRef.current) {
      return;
    }
    
    if (isDateChanged) {
      prevSelectedDateRef.current = selectedDate;
    }
    hasInitializedRef.current = true;

    // loadSelections는 selectedDate를 dependency로 가지므로 selectedDate 변경 시 재생성됨
    // dependency에서 제외하고 selectedDate만 사용하여 무한 루프 방지
    loadSelections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedDate]);

  const handleEdit = (selection: MenuSelection) => {
    setEditingSelectionId(selection.id);
    // 현재 payload를 편집용으로 복사
    setEditingPayload({
      breakfast: [...selection.menuPayload.breakfast],
      lunch: [...selection.menuPayload.lunch],
      dinner: [...selection.menuPayload.dinner],
      etc: [...selection.menuPayload.etc],
    });
  };

  const handleEditCancel = () => {
    setIsGlobalEditing(false);
    setEditingSelectionId(null);
    setEditingPayload(null);
  };

  const handleRemoveMenu = (slot: MenuSlot, index: number) => {
    setEditingPayload((prev) => {
      if (!prev) return prev;
      const updatedSlotMenus = prev[slot].filter((_, i) => i !== index);
      return {
        ...prev,
        [slot]: updatedSlotMenus,
      };
    });
  };

  const handleSave = async () => {
    if (!editingSelectionId || !editingPayload) {
      return;
    }

    setIsUpdating(editingSelectionId);
    try {
      const { breakfast, lunch, dinner, etc } = editingPayload;

      // 네 slot을 한 번에 덮어쓰기
      await menuService.updateMenuSelection(editingSelectionId, {
        breakfast,
        lunch,
        dinner,
        etc,
      });

      alert('메뉴 선택이 저장되었습니다.');
      await loadSelections();
      setEditingSelectionId(null);
      setEditingPayload(null);
      setIsGlobalEditing(false);
    } catch (error: unknown) {
      handleError(error, 'MenuSelectionHistory');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancel = async (selectionId: number) => {
    if (!confirm('이 메뉴 선택을 취소하시겠습니까?')) {
      return;
    }

    setIsUpdating(selectionId);
    try {
      await menuService.updateMenuSelection(selectionId, { cancel: true });
      handleSuccess('메뉴 선택이 취소되었습니다.');
      await loadSelections();
    } catch (error: unknown) {
      handleError(error, 'MenuSelectionHistory');
    } finally {
      setIsUpdating(null);
    }
  };


  // 날짜별로 그룹핑
  const groupedSelections = selections.reduce((acc, selection) => {
    const date = selection.selectedDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(selection);
    return acc;
  }, {} as Record<string, MenuSelection[]>);

  const sortedDates = Object.keys(groupedSelections).sort((a, b) => b.localeCompare(a));

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">메뉴 선택 이력</h1>
          <p className="mt-2 text-sm text-slate-400">선택한 메뉴들을 날짜별로 확인하고 관리할 수 있습니다.</p>
        </div>

        {/* 날짜 필터 + 전체 편집 토글 */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <label htmlFor="date-filter" className="mb-2 block text-sm font-medium text-slate-200">
              날짜 필터
            </label>
            <div className="flex items-center gap-2">
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate('')}
                  className="ml-1"
                >
                  전체 보기
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isGlobalEditing ? 'ghost' : 'primary'}
              size="sm"
              onClick={() => {
                if (isGlobalEditing) {
                  // 편집 종료
                  setIsGlobalEditing(false);
                  setEditingSelectionId(null);
                  setEditingPayload(null);
                } else {
                  // 편집 모드 시작
                  setIsGlobalEditing(true);
                }
              }}
              className={
                isGlobalEditing
                  ? 'border border-white/20 bg-white/5 px-4 text-xs text-slate-200 hover:bg-white/10'
                  : 'bg-gradient-to-r from-orange-500 to-rose-500 px-4 text-xs text-white shadow-sm shadow-orange-500/40'
              }
            >
              {isGlobalEditing ? '편집 종료' : '편집하기'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <p className="text-slate-400">선택한 메뉴가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const selectionsForDate = groupedSelections[date];
              if (!selectionsForDate || selectionsForDate.length === 0) {
                return null;
              }

              // 하루에 1개의 Row를 사용한다는 개념에 맞춰, 첫 번째 selection만 사용
              const selection = selectionsForDate[0];
              const isEditing = editingSelectionId === selection.id;
              const slots: { key: MenuSlot; label: string }[] = [
                { key: 'breakfast', label: '아침' },
                { key: 'lunch', label: '점심' },
                { key: 'dinner', label: '저녁' },
                { key: 'etc', label: '기타' },
              ];

              return (
                <div
                  key={date}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur"
                >
                  {/* 상단: 날짜 + (편집/전체취소) 액션 영역 */}
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{formatDateKorean(date)}</h2>
                    <div className="flex items-center gap-2 text-xs">
                      {isGlobalEditing && (
                        <>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleCancel(selection.id)}
                              disabled={isUpdating === selection.id}
                              className="font-medium text-red-400 hover:text-red-300 disabled:opacity-60"
                            >
                              전체 취소
                            </button>
                          )}
                          {!isEditing && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleEdit(selection)}
                              disabled={isUpdating === selection.id}
                              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm shadow-orange-500/40"
                            >
                              수정
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* 슬롯별 메뉴 내역 */}
                  <div className="space-y-3">
                    {slots.map(({ key, label }) => {
                      const basePayload = isEditing && editingPayload ? editingPayload : selection.menuPayload;
                      const menus = basePayload[key];
                      if (!menus || menus.length === 0) return null;

                      return (
                        <div key={key} className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="mb-1 text-sm font-medium text-slate-200">{label}</p>
                            <div className="flex flex-wrap gap-2 pt-0.5">
                              {menus.map((menuName, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/15 px-3 py-1.5 text-sm font-medium text-orange-50"
                                >
                                  <span>{menuName}</span>
                                  {isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMenu(key, idx)}
                                      className="ml-1 text-[11px] text-orange-100/80 hover:text-white"
                                      aria-label="메뉴 삭제"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 하단: 저장 / 취소 버튼 (편집 중일 때만) */}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    {isEditing && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSave}
                          isLoading={isUpdating === selection.id}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-white shadow-sm shadow-emerald-500/40"
                        >
                          저장
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditCancel}
                          disabled={isUpdating === selection.id}
                          className="border border-white/20 bg-white/5 px-4 text-xs text-slate-200 hover:bg-white/10"
                        >
                          취소
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

