/**
 * DateFilterPanel - Simplified date filter UI component
 *
 * Contains only DateInput for calendar selection (YYYY/MM/DD + calendar icon)
 */

import { DateInput } from '@/components/common/DateInput';
import { useTranslation } from 'react-i18next';

export interface DateFilterPanelProps {
  selectedDate: string | null;
  onDateChange: (value: string) => void;
}

export const DateFilterPanel = ({
  selectedDate,
  onDateChange,
}: DateFilterPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-start">
      <DateInput
        value={selectedDate || ''}
        onChange={onDateChange}
        placeholder={t('dateFilter.selectDate')}
        className="w-40"
      />
    </div>
  );
};
