import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MenuFilterTabsProps {
  menus: string[];
  activeMenu: string | 'all';
  onMenuChange: (menu: string | 'all') => void;
  menuCounts: Record<string, number>;
  loadingMenu?: string | null;
}

export function MenuFilterTabs({
  menus,
  activeMenu,
  onMenuChange,
  menuCounts,
  loadingMenu,
}: MenuFilterTabsProps) {
  const { t } = useTranslation();
  const totalCount = Object.values(menuCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div
      role="tablist"
      className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
    >
      {/* "전체" tab */}
      <button
        role="tab"
        aria-selected={activeMenu === 'all'}
        onClick={() => onMenuChange('all')}
        className={cn(
          'min-h-[44px] shrink-0 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200',
          activeMenu === 'all'
            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md font-semibold'
            : 'bg-bg-secondary/80 text-text-secondary active:scale-95'
        )}
      >
        {t('restaurant.all')} {totalCount}
      </button>

      {menus.map((menu) => {
        const isActive = activeMenu === menu;
        const isLoading = loadingMenu === menu;
        return (
          <button
            key={menu}
            role="tab"
            aria-selected={isActive}
            onClick={() => onMenuChange(menu)}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md font-semibold'
                : 'bg-bg-secondary/80 text-text-secondary active:scale-95'
            )}
          >
            {isLoading && (
              <Loader2 className="mr-1.5 inline-block h-3.5 w-3.5 animate-spin" />
            )}
            {menu} {menuCounts[menu] ?? 0}
          </button>
        );
      })}
    </div>
  );
}
