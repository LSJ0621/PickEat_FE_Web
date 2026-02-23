/**
 * 메뉴 선택 이력 페이지
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DateFilterPanel } from '@/components/common/DateFilterPanel';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { useInitialDataLoad } from '@/hooks/common/useInitialDataLoad';
import { useDateFilter } from '@/hooks/common/useDateFilter';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { MenuPayload, MenuSelection, MenuSlot } from '@/types/menu';
import { formatDateStandard } from '@/utils/format';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Pencil } from 'lucide-react';

export const MenuSelectionHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError, handleSuccess } = useErrorHandler();
  const [selections, setSelections] = useState<MenuSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [editingSelectionId, setEditingSelectionId] = useState<number | null>(null);
  const [editingPayload, setEditingPayload] = useState<MenuPayload | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<{ show: boolean; selectionId: number | null }>({ show: false, selectionId: null });

  const { selectedDate, handleDateChange } = useDateFilter();

  const loadSelections = useCallback(async () => {
    setLoading(true);
    try {
      const result = await menuService.getMenuSelections(selectedDate || undefined);
      const filtered = result.selections.filter((s) => {
        const { breakfast, lunch, dinner, etc } = s.menuPayload;
        return [...breakfast, ...lunch, ...dinner, ...etc].some((name) => name.trim() !== '');
      });
      setSelections(filtered);
    } catch (error: unknown) {
      handleError(error, 'MenuSelectionHistory');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, handleError]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); }
  }, [isAuthenticated, navigate]);

  useInitialDataLoad({ enabled: isAuthenticated, loadFn: loadSelections, dependencies: [selectedDate] });

  const handleEdit = (selection: MenuSelection) => {
    setEditingSelectionId(selection.id);
    setEditingPayload({
      breakfast: [...selection.menuPayload.breakfast],
      lunch: [...selection.menuPayload.lunch],
      dinner: [...selection.menuPayload.dinner],
      etc: [...selection.menuPayload.etc],
    });
  };

  const handleEditCancel = () => { setIsGlobalEditing(false); setEditingSelectionId(null); setEditingPayload(null); };

  const handleRemoveMenu = (slot: MenuSlot, index: number) => {
    setEditingPayload((prev) => prev ? { ...prev, [slot]: prev[slot].filter((_, i) => i !== index) } : prev);
  };

  const handleSave = async () => {
    if (!editingSelectionId || !editingPayload) return;
    setIsUpdating(editingSelectionId);
    try {
      const { breakfast, lunch, dinner, etc } = editingPayload;
      await menuService.updateMenuSelection(editingSelectionId, { breakfast, lunch, dinner, etc });
      handleSuccess(t('menu.menuSelectionSaved'));
      await loadSelections();
      setEditingSelectionId(null); setEditingPayload(null); setIsGlobalEditing(false);
    } catch (error: unknown) {
      handleError(error, 'MenuSelectionHistory');
    } finally { setIsUpdating(null); }
  };

  const handleCancelConfirm = async () => {
    const selectionId = cancelConfirm.selectionId;
    if (!selectionId) return;
    setCancelConfirm({ show: false, selectionId: null });
    setIsUpdating(selectionId);
    try {
      await menuService.updateMenuSelection(selectionId, { cancel: true });
      handleSuccess(t('menu.menuSelectionCancelled'));
      await loadSelections();
    } catch (error: unknown) {
      handleError(error, 'MenuSelectionHistory');
    } finally { setIsUpdating(null); }
  };

  const groupedSelections = selections.reduce((acc, s) => {
    if (!acc[s.selectedDate]) acc[s.selectedDate] = [];
    acc[s.selectedDate].push(s);
    return acc;
  }, {} as Record<string, MenuSelection[]>);

  const sortedDates = Object.keys(groupedSelections).sort((a, b) => b.localeCompare(a));

  const slots: { key: MenuSlot; label: string }[] = [
    { key: 'breakfast', label: t('menu.breakfast') },
    { key: 'lunch', label: t('menu.lunch') },
    { key: 'dinner', label: t('menu.dinner') },
    { key: 'etc', label: t('menu.etc') },
  ];

  if (!isAuthenticated) return null;

  return (
    <PageContainer>
      <PageHeader
        title={t('menu.selectionHistory')}
        subtitle={t('menu.selectionHistoryDesc')}
        action={
          <Button
            variant={isGlobalEditing ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => {
              if (isGlobalEditing) { setIsGlobalEditing(false); setEditingSelectionId(null); setEditingPayload(null); }
              else setIsGlobalEditing(true);
            }}
            className={isGlobalEditing
              ? 'border border-border-default bg-bg-primary px-4 text-xs text-text-secondary hover:bg-bg-hover'
              : 'bg-gradient-to-r from-orange-500 to-rose-500 px-4 text-xs text-text-inverse shadow-sm shadow-orange-500/40'}
          >
            <span className="flex items-center gap-1.5">
              {isGlobalEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              {isGlobalEditing ? t('menu.exitEditMode') : t('menu.editMode')}
            </span>
          </Button>
        }
      />

      <div className="mb-6">
        <DateFilterPanel selectedDate={selectedDate} onDateChange={handleDateChange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-bg-surface p-10 text-center shadow-lg">
          <p className="text-text-tertiary">{t('menu.noSelections')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const selectionsForDate = groupedSelections[date];
            if (!selectionsForDate || selectionsForDate.length === 0) return null;
            const selection = selectionsForDate[0];
            const isEditing = editingSelectionId === selection.id;

            return (
              <div key={date} className={`rounded-2xl border bg-bg-surface p-5 shadow-md transition-all ${isEditing ? 'border-brand-primary/40 ring-1 ring-brand-primary/20' : 'border-border-default hover:border-border-focus'}`}>
                {/* 날짜 + 액션 */}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">{formatDateStandard(date)}</h2>
                  {isGlobalEditing && (
                    <div className="flex items-center gap-2 text-xs">
                      {isEditing ? (
                        <button type="button" onClick={() => setCancelConfirm({ show: true, selectionId: selection.id })}
                          disabled={isUpdating === selection.id}
                          className="font-medium text-red-500 hover:text-red-600 disabled:opacity-60 transition-colors">
                          {t('menu.cancelAll')}
                        </button>
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => handleEdit(selection)} disabled={isUpdating === selection.id}
                          className="bg-gradient-to-r from-orange-500 to-rose-500 text-text-inverse shadow-sm shadow-orange-500/40">
                          {t('menu.modify')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* 슬롯별 메뉴 */}
                <div className="space-y-3">
                  {slots.map(({ key, label }) => {
                    const basePayload = isEditing && editingPayload ? editingPayload : selection.menuPayload;
                    const menus = basePayload[key];
                    if (!menus || menus.length === 0) return null;
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <p className="mt-1 w-14 shrink-0 text-xs font-medium text-text-tertiary">{label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {menus.map((menuName, idx) => (
                            <span key={idx} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${isEditing ? 'border-orange-500/60 bg-orange-500/15 text-orange-700' : 'border-orange-500/30 bg-orange-500/10 text-orange-700'}`}>
                              <span>{menuName}</span>
                              {isEditing && (
                                <button type="button" onClick={() => handleRemoveMenu(key, idx)}
                                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-orange-600/80 hover:bg-orange-500/20 hover:text-orange-800 transition-colors"
                                  aria-label={t('menu.deleteMenu')}>
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 편집 저장/취소 */}
                {isEditing && (
                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-border-default pt-4">
                    <Button variant="ghost" size="sm" onClick={handleEditCancel} disabled={isUpdating === selection.id}
                      className="border border-border-default bg-bg-primary px-4 text-xs text-text-secondary hover:bg-bg-hover">
                      {t('common.cancel')}
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} isLoading={isUpdating === selection.id}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-text-inverse shadow-sm shadow-emerald-500/40">
                      {t('common.save')}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={cancelConfirm.show}
        title={t('menu.cancelMenuSelection')}
        message={t('menu.cancelMenuSelectionMessage')}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelConfirm({ show: false, selectionId: null })}
        confirmLabel={t('menu.confirmCancel')}
        cancelLabel={t('menu.goBack')}
        variant="danger"
      />
    </PageContainer>
  );
};
