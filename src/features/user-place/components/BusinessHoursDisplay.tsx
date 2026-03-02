import { useTranslation } from 'react-i18next';
import { Badge } from '@shared/ui/badge';
import type { BusinessHours, DayOfWeek, DayHours } from '@features/user-place/types';

interface BusinessHoursDisplayProps {
  businessHours: BusinessHours | null;
}

const DAY_ORDER: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface BreakGroup {
  breakStart: string;
  breakEnd: string;
  days: DayOfWeek[];
}

function groupBreakTimes(days: Partial<Record<DayOfWeek, DayHours>>): BreakGroup[] {
  const groups: Map<string, BreakGroup> = new Map();

  DAY_ORDER.forEach((day) => {
    const hours = days[day];
    if (!hours?.breakStart || !hours?.breakEnd) return;
    const key = `${hours.breakStart}-${hours.breakEnd}`;
    const existing = groups.get(key);
    if (existing) {
      existing.days.push(day);
    } else {
      groups.set(key, { breakStart: hours.breakStart, breakEnd: hours.breakEnd, days: [day] });
    }
  });

  return Array.from(groups.values());
}

export function BusinessHoursDisplay({ businessHours }: BusinessHoursDisplayProps) {
  const { t } = useTranslation();

  const getDayLabel = (day: DayOfWeek) => t(`userPlace.days.${day}`);

  function formatDayRange(days: DayOfWeek[]): string {
    if (days.length === 0) return '';
    if (days.length === 1) return getDayLabel(days[0]);

    const indices = days.map((d) => DAY_ORDER.indexOf(d));
    const isConsecutive = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);

    if (isConsecutive && days.length > 2) {
      return `${getDayLabel(days[0])}~${getDayLabel(days[days.length - 1])}`;
    }

    return days.map((d) => getDayLabel(d)).join(', ');
  }

  if (!businessHours) return null;

  if (businessHours.isOpen247) {
    return (
      <Badge variant="outline" className="text-xs">
        {t('userPlace.form.open247')}
      </Badge>
    );
  }

  if (businessHours.is24Hours) {
    const closedDays = DAY_ORDER.filter((day) => !(businessHours.days ?? {})[day]);
    return (
      <div className="space-y-2">
        <Badge variant="outline" className="text-xs">
          {t('userPlace.form.is24Hours')}
        </Badge>
        {closedDays.length > 0 && (
          <ul className="space-y-1">
            {closedDays.map((day) => (
              <li key={day} className="flex items-center gap-4 text-sm">
                <span className="w-4 shrink-0 text-text-secondary">{getDayLabel(day)}</span>
                <span className="text-text-tertiary">{t('userPlace.form.closed')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const breakGroups = groupBreakTimes(businessHours.days ?? {});

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {DAY_ORDER.map((day) => {
          const hours = (businessHours.days ?? {})[day];
          return (
            <li key={day} className="flex items-center gap-4 text-sm">
              <span className="w-4 shrink-0 text-text-secondary">{getDayLabel(day)}</span>
              {hours ? (
                <span className="text-text-primary">
                  {hours.open} ~ {hours.close}
                </span>
              ) : (
                <span className="text-text-tertiary">{t('userPlace.form.closed')}</span>
              )}
            </li>
          );
        })}
      </ul>

      {breakGroups.length > 0 && (
        <div className="space-y-1 border-t border-border-default pt-2">
          {breakGroups.map((group, idx) => (
            <p key={idx} className="text-xs text-text-tertiary">
              {t('userPlace.form.breakTimeDisplay', { start: group.breakStart, end: group.breakEnd, days: formatDayRange(group.days) })}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
