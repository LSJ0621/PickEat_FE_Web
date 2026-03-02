/**
 * User Place 영업시간 입력 필드 컴포넌트
 * 요일 그룹 선택 -> 시간 입력 -> 추가 방식의 구조화된 입력 UI
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { Checkbox } from '@shared/ui/checkbox';
import { TimePickerInput } from '@shared/components/TimePicker';
import { Label } from '@shared/ui/label';
import type { BusinessHours, DayOfWeek, DayHours } from '@features/user-place/types';

interface UserPlaceBusinessHoursFieldProps {
  businessHours: BusinessHours;
  onChange: (hours: BusinessHours) => void;
}

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface AddFormState {
  selectedDays: DayOfWeek[];
  open: string;
  close: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

const INITIAL_FORM: AddFormState = {
  selectedDays: [],
  open: '09:00',
  close: '22:00',
  hasBreak: false,
  breakStart: '15:00',
  breakEnd: '17:00',
};

/** 같은 시간대끼리 그룹화하여 반환 */
function groupDaysByHours(days: Partial<Record<DayOfWeek, DayHours>>): Array<{
  days: DayOfWeek[];
  hours: DayHours;
}> {
  const groups: Map<string, { days: DayOfWeek[]; hours: DayHours }> = new Map();

  for (const day of ALL_DAYS) {
    const hours = days[day];
    if (!hours) continue;
    const key = `${hours.open}-${hours.close}-${hours.breakStart ?? ''}-${hours.breakEnd ?? ''}`;
    const existing = groups.get(key);
    if (existing) {
      existing.days.push(day);
    } else {
      groups.set(key, { days: [day], hours });
    }
  }

  return Array.from(groups.values());
}

export function UserPlaceBusinessHoursField({
  businessHours,
  onChange,
}: UserPlaceBusinessHoursFieldProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<AddFormState>(INITIAL_FORM);

  const getDayLabel = (day: DayOfWeek) => t(`userPlace.days.${day}`);

  const { isOpen247, is24Hours, days: rawDays } = businessHours;
  const days = rawDays ?? {};

  const handleIsOpen247Change = useCallback(
    (checked: boolean) => {
      onChange({ ...businessHours, isOpen247: checked, is24Hours: checked ? false : is24Hours });
    },
    [businessHours, is24Hours, onChange]
  );

  const handleIs24HoursChange = useCallback(
    (checked: boolean) => {
      onChange({ ...businessHours, is24Hours: checked });
    },
    [businessHours, onChange]
  );

  const toggleDay = useCallback((day: DayOfWeek) => {
    setForm((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  }, []);

  const handleAddHours = useCallback(() => {
    if (form.selectedDays.length === 0) return;

    const newHours: DayHours = {
      open: form.open,
      close: form.close,
      ...(form.hasBreak && {
        breakStart: form.breakStart,
        breakEnd: form.breakEnd,
      }),
    };

    const updatedDays = { ...days };
    for (const day of form.selectedDays) {
      updatedDays[day] = newHours;
    }

    onChange({ ...businessHours, days: updatedDays });
    setForm({ ...INITIAL_FORM, selectedDays: [] });
  }, [form, days, businessHours, onChange]);

  const handleRemoveGroup = useCallback(
    (groupDays: DayOfWeek[]) => {
      const updatedDays = { ...days };
      for (const day of groupDays) {
        delete updatedDays[day];
      }
      onChange({ ...businessHours, days: updatedDays });
    },
    [days, businessHours, onChange]
  );

  const canAdd = form.selectedDays.length > 0
    && form.open
    && form.close
    && form.close > form.open
    && (!form.hasBreak || (form.breakStart && form.breakEnd && form.breakStart > form.open && form.breakEnd > form.breakStart && form.breakEnd < form.close));
  const groups = groupDaysByHours(days);
  const registeredDays = new Set(Object.keys(days) as DayOfWeek[]);
  const offDays = ALL_DAYS.filter((d) => !registeredDays.has(d));

  return (
    <div className="space-y-4">
      <Label className="block text-sm font-semibold text-text-primary">{t('userPlace.form.businessHours')}</Label>

      {/* 특수 옵션 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="open247"
            checked={isOpen247}
            onCheckedChange={(v) => handleIsOpen247Change(v === true)}
          />
          <Label htmlFor="open247" className="cursor-pointer text-sm text-text-primary">
            {t('userPlace.form.open247')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="is24h"
            checked={is24Hours}
            onCheckedChange={(v) => handleIs24HoursChange(v === true)}
            disabled={isOpen247}
          />
          <Label
            htmlFor="is24h"
            className={`cursor-pointer text-sm ${isOpen247 ? 'text-text-tertiary' : 'text-text-primary'}`}
          >
            {t('userPlace.form.is24Hours')}
          </Label>
        </div>
      </div>

      {/* 영업시간 입력 영역 (연중무휴 24시간 선택 시 숨김) */}
      {!isOpen247 && (
        <div className="rounded-2xl border border-border-default bg-bg-secondary p-4 space-y-4">

          {/* 요일 선택 */}
          <div>
            <p className="mb-2 text-xs font-medium text-text-secondary">{t('userPlace.form.selectDays')}</p>
            {/* 모바일: 월~목 / 금~일 2줄, 웹: 1줄 */}
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const isSelected = form.selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    aria-pressed={isSelected}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-brand-primary text-white'
                        : 'border border-border-default bg-bg-primary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {getDayLabel(day)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 시간 입력 (24시간 영업 시 비활성화) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs text-text-secondary">{t('userPlace.form.openTime')}</Label>
              <TimePickerInput
                value={form.open}
                onChange={(v) => setForm((p) => ({ ...p, open: v }))}
                disabled={is24Hours}
                aria-label={t('userPlace.form.openTimeAriaLabel')}
              />
            </div>
            <span className="hidden text-text-tertiary sm:mt-8 sm:block">~</span>
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs text-text-secondary">{t('userPlace.form.closeTime')}</Label>
              <TimePickerInput
                value={form.close}
                onChange={(v) => setForm((p) => ({ ...p, close: v }))}
                disabled={is24Hours}
                aria-label={t('userPlace.form.closeTimeAriaLabel')}
              />
            </div>
          </div>

          {/* 브레이크타임 */}
          <div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasBreak"
                checked={form.hasBreak}
                onCheckedChange={(v) => setForm((p) => ({ ...p, hasBreak: v === true }))}
                disabled={is24Hours}
              />
              <Label
                htmlFor="hasBreak"
                className={`cursor-pointer text-sm ${is24Hours ? 'text-text-tertiary' : 'text-text-primary'}`}
              >
                {t('userPlace.form.breakTime')}
              </Label>
            </div>
            {form.hasBreak && !is24Hours && (
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex flex-1 flex-col gap-1">
                  <Label className="text-xs text-text-secondary">{t('userPlace.form.breakStart')}</Label>
                  <TimePickerInput
                    value={form.breakStart}
                    onChange={(v) => setForm((p) => ({ ...p, breakStart: v }))}
                    aria-label={t('userPlace.form.breakStartAriaLabel')}
                  />
                </div>
                <span className="hidden text-text-tertiary sm:mt-8 sm:block">~</span>
                <div className="flex flex-1 flex-col gap-1">
                  <Label className="text-xs text-text-secondary">{t('userPlace.form.breakEnd')}</Label>
                  <TimePickerInput
                    value={form.breakEnd}
                    onChange={(v) => setForm((p) => ({ ...p, breakEnd: v }))}
                    aria-label={t('userPlace.form.breakEndAriaLabel')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 추가 버튼 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddHours}
            disabled={!canAdd}
            className="w-full"
            aria-label={t('userPlace.form.addHoursAriaLabel')}
          >
            {t('userPlace.form.menuAdd')}
          </Button>
        </div>
      )}

      {/* 등록된 영업시간 그룹 */}
      {!isOpen247 && (groups.length > 0 || offDays.length > 0) && (
        <div className="space-y-2" aria-label={t('userPlace.form.addedHoursAriaLabel')}>
          {groups.map((group, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between rounded-xl border border-border-default bg-bg-secondary px-4 py-3"
            >
              <div className="text-sm text-text-primary">
                <span className="font-medium">
                  {group.days.map((d) => getDayLabel(d)).join(', ')}
                </span>
                <span className="ml-2 text-text-secondary">
                  {group.hours.open}~{group.hours.close}
                </span>
                {group.hours.breakStart && group.hours.breakEnd && (
                  <span className="ml-2 text-xs text-text-tertiary">
                    {t('userPlace.form.breakLabel', { start: group.hours.breakStart, end: group.hours.breakEnd })}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveGroup(group.days)}
                className="ml-3 shrink-0 text-xs text-text-tertiary transition-colors hover:text-red-500"
                aria-label={t('userPlace.form.removeHoursAriaLabel', { days: group.days.map((d) => getDayLabel(d)).join(', ') })}
              >
                {t('userPlace.form.remove')}
              </button>
            </div>
          ))}

          {/* 휴무 요일 */}
          {offDays.length > 0 && (
            <div className="rounded-xl border border-border-default bg-bg-secondary px-4 py-3 text-sm text-text-tertiary">
              <span className="font-medium">{offDays.map((d) => getDayLabel(d)).join(', ')}</span>
              <span className="ml-2">{t('userPlace.form.closedDay')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
