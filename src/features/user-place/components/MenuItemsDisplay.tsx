import { useTranslation } from 'react-i18next';
import type { MenuItem } from '@features/user-place/types';

interface MenuItemsDisplayProps {
  menuItems: MenuItem[];
}

export function MenuItemsDisplay({ menuItems }: MenuItemsDisplayProps) {
  const { t } = useTranslation();

  if (!menuItems.length) return null;

  return (
    <ul className="space-y-1">
      {menuItems.map((item, idx) => (
        <li key={idx} className="flex items-center justify-between gap-4">
          <span className="text-sm text-text-primary">{item.name}</span>
          <span className="shrink-0 text-sm text-text-secondary">
            {item.price.toLocaleString('ko-KR')}{t('userPlace.form.currencyUnit')}
          </span>
        </li>
      ))}
    </ul>
  );
}
