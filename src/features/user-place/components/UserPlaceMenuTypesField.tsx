/**
 * User Place 메뉴 아이템 입력 필드 컴포넌트 (이름 + 가격)
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import type { MenuItem } from '@features/user-place/types';

interface UserPlaceMenuItemsFieldProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onRemoveMenuItem: (index: number) => void;
}

const MAX_MENU_ITEMS = 10;
const MAX_PRICE = 9_999_999;

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function UserPlaceMenuTypesField({
  menuItems,
  onAddMenuItem,
  onRemoveMenuItem,
}: UserPlaceMenuItemsFieldProps) {
  const { t } = useTranslation();
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  const isDisabled = menuItems.length >= MAX_MENU_ITEMS;

  const parsedPrice = Number(priceInput);
  const isValidPrice =
    priceInput !== '' && !isNaN(parsedPrice) && parsedPrice >= 0 && parsedPrice <= MAX_PRICE;
  const canAdd = nameInput.trim().length > 0 && isValidPrice && !isDisabled;

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    onAddMenuItem({ name: nameInput.trim(), price: parsedPrice });
    setNameInput('');
    setPriceInput('');
  }, [canAdd, nameInput, parsedPrice, onAddMenuItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPriceInput(value);
  }, []);

  return (
    <div>
      <Label className="mb-2 block text-sm font-semibold text-text-primary">
        {t('userPlace.form.menu')} <span className="text-red-400">*</span>
      </Label>

      {/* 입력 영역 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={50}
          className="rounded-2xl sm:flex-1"
          placeholder={t('userPlace.form.menuNamePlaceholder')}
          disabled={isDisabled}
          aria-label={t('userPlace.form.menuNameAriaLabel')}
        />
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-36 sm:flex-none">
            <Input
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={handlePriceChange}
              onKeyDown={handleKeyDown}
              className="rounded-2xl pr-8"
              placeholder={t('userPlace.form.menuPricePlaceholder')}
              disabled={isDisabled}
              aria-label={t('userPlace.form.menuPriceAriaLabel')}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
              {t('userPlace.form.currencyUnit')}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            disabled={!canAdd}
            aria-label={t('userPlace.form.menuAddAriaLabel')}
          >
            {t('userPlace.form.menuAdd')}
          </Button>
        </div>
      </div>

      {/* 힌트 / 에러 */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-text-tertiary">{t('userPlace.form.menuMaxCount', { max: MAX_MENU_ITEMS, current: menuItems.length })}</p>
        {menuItems.length === 0 && (
          <p className="text-xs text-red-400">{t('userPlace.form.menuMinRequired')}</p>
        )}
      </div>

      {/* 등록된 메뉴 리스트 */}
      {menuItems.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label={t('userPlace.form.menuListAriaLabel')}>
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between rounded-xl border border-border-default bg-bg-secondary px-4 py-2"
            >
              <span className="text-sm text-text-primary">
                {item.name}
                <span className="ml-2 text-text-secondary">
                  {formatPrice(item.price)}{t('userPlace.form.currencyUnit')}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemoveMenuItem(idx)}
                className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-red-100 hover:text-red-500"
                aria-label={t('userPlace.form.menuRemoveAriaLabel', { name: item.name })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
