import { useTranslation } from 'react-i18next';
import { AddressSearchInput } from '@/components/features/user/setup/AddressSearchInput';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useFocusTrap } from '@/hooks/common/useFocusTrap';
import type { AddressSearchResult, SelectedAddress, UserAddress } from '@/types/user';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface AddressAddModalProps {
  open: boolean;
  addresses: UserAddress[];
  addressQuery: string;
  searchResults: AddressSearchResult[];
  isSearching: boolean;
  selectedAddress: SelectedAddress | null;
  addressAlias: string;
  isSaving: boolean;
  hasSearchedAddress: boolean;
  onClose: () => void;
  onAddressQueryChange: (query: string) => void;
  onSearch: () => void;
  onSelectAddress: (address: AddressSearchResult) => void;
  onAddressAliasChange: (alias: string) => void;
  onAddAddress: () => Promise<boolean>;
  onClearSelection: () => void;
}

export const AddressAddModal = ({
  open,
  addresses,
  addressQuery,
  searchResults,
  isSearching,
  selectedAddress,
  addressAlias,
  isSaving,
  hasSearchedAddress,
  onClose,
  onAddressQueryChange,
  onSearch,
  onSelectAddress,
  onAddressAliasChange,
  onAddAddress,
  onClearSelection,
}: AddressAddModalProps) => {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);
  const focusTrapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  const handleAddAddress = async () => {
    const success = await onAddAddress();
    if (success) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-add-modal-title"
        className={`relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-t-xl md:rounded-xl bg-bg-surface p-6 md:p-8 shadow-lg md:border md:border-border-default ${
          isAnimating ? 'modal-content-responsive-enter' : 'modal-content-responsive-exit'
        }`}
      >
        <div className="flex justify-center pb-3 md:hidden">
          <div className="h-1 w-12 rounded-full bg-border-default" />
        </div>

        <ModalCloseButton onClose={onClose} />
        <h2 id="address-add-modal-title" className="mb-6 text-xl font-semibold text-text-primary">{t('user.address.add')}</h2>
        <p className="mb-4 text-sm text-text-tertiary">
          {t('user.address.addModalDescription', { current: addresses.length, remaining: Math.max(0, 4 - addresses.length) })}
          <br />
          <span className="text-xs text-text-tertiary">{t('user.address.addModalNote')}</span>
        </p>

        <div className="space-y-4">
          <AddressSearchInput
            addressQuery={addressQuery}
            isSearching={isSearching}
            onAddressQueryChange={onAddressQueryChange}
            onSearch={onSearch}
          />

          <AddressSearchResults
            searchResults={searchResults}
            isSearching={isSearching}
            hasSearchedAddress={hasSearchedAddress}
            onSelectAddress={onSelectAddress}
            maxHeight="max-h-60"
          />

          {/* 선택한 주소 */}
          {selectedAddress && (
            <div data-testid="selected-address" className="rounded-[var(--radius-md)] border border-brand-primary/30 bg-bg-secondary p-4">
              <div className="mb-3">
                <p className="text-xs text-success">{t('user.address.selected')}</p>
                <p className="mt-1 text-text-primary font-medium">
                  {selectedAddress.roadAddress || selectedAddress.address}
                </p>
                {selectedAddress.roadAddress && (
                  <p className="mt-1 text-xs text-text-tertiary">{selectedAddress.address}</p>
                )}
              </div>
              <input
                type="text"
                value={addressAlias}
                onChange={(e) => onAddressAliasChange(e.target.value)}
                placeholder={t('user.address.aliasPlaceholder')}
                maxLength={20}
                className="w-full rounded-[var(--radius-md)] border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <button
                onClick={onClearSelection}
                className="mt-2 text-xs text-error hover:text-error/80"
              >
                {t('user.address.clearSelection')}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              disabled={isSaving}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddAddress}
              variant="primary"
              isLoading={isSaving}
              disabled={!selectedAddress || addresses.length >= 4}
              className="flex-1"
              size="lg"
              data-testid="address-add-submit"
            >
              {t('user.address.addButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
