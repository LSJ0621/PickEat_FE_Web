/**
 * User Place 메뉴 종류 입력 필드 컴포넌트
 */

import { Button } from '@shared/components/Button';
import { RemovableBadge } from '@shared/components/RemovableBadge';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { useTranslation } from 'react-i18next';

interface UserPlaceMenuTypesFieldProps {
  menuTypes: string[];
  menuInput: string;
  onMenuInputChange: (value: string) => void;
  onAddMenu: () => void;
  onRemoveMenu: (index: number) => void;
}

export function UserPlaceMenuTypesField({
  menuTypes,
  menuInput,
  onMenuInputChange,
  onAddMenu,
  onRemoveMenu,
}: UserPlaceMenuTypesFieldProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Label className="mb-2 block text-sm font-semibold text-text-primary">
        {t('userPlace.form.menuTypes')} <span className="text-red-400">*</span>
      </Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={menuInput}
          onChange={(e) => onMenuInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddMenu();
            }
          }}
          maxLength={30}
          className="flex-1 rounded-2xl"
          placeholder={t('userPlace.form.menuTypesPlaceholder')}
          disabled={menuTypes.length >= 10}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddMenu}
          disabled={!menuInput.trim() || menuTypes.length >= 10}
        >
          {t('setup.preferences.add')}
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-text-tertiary">
          {t('userPlace.form.menuTypesHint')} ({menuTypes.length}/10)
        </p>
        {menuTypes.length === 0 && (
          <p className="text-xs text-red-400">{t('userPlace.form.menuTypesRequired')}</p>
        )}
      </div>
      {menuTypes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {menuTypes.map((menu, idx) => (
            <RemovableBadge
              key={idx}
              variant="menu"
              label={menu}
              onRemove={() => onRemoveMenu(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
