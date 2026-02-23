/**
 * DateFilterPanel - Simplified date filter UI component
 *
 * Contains DateInput for calendar selection with optional clear button.
 */

import { DateInput } from '@shared/components/DateInput';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export interface DateFilterPanelProps {
  selectedDate: string | null;
  onDateChange: (value: string) => void;
  onClearDate?: () => void;
}

export const DateFilterPanel = ({
  selectedDate,
  onDateChange,
  onClearDate,
}: DateFilterPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <DateInput
        value={selectedDate || ''}
        onChange={onDateChange}
        placeholder={t('dateFilter.selectDate')}
        className="w-44"
      />
      {selectedDate && onClearDate && (
        <button
          type="button"
          onClick={onClearDate}
          className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-surface px-2.5 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label={t('dateFilter.clearDate')}
        >
          <X className="h-3.5 w-3.5" />
          <span>{t('dateFilter.clearDate')}</span>
        </button>
      )}
    </div>
  );
};
