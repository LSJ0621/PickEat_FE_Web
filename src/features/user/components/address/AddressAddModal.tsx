import { useTranslation } from 'react-i18next';
import { AddressSearchInput } from '@features/user/components/setup/AddressSearchInput';
import { AddressSearchResults } from '@shared/components/AddressSearchResults';
import { Button } from '@shared/components/Button';
import { ModalCloseButton } from '@shared/components/ModalCloseButton';
import type { AddressSearchResult, SelectedAddress, UserAddress } from '@features/user/types';
import { createPortal } from 'react-dom';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { Z_INDEX } from '@shared/utils/constants';

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
  const { isAnimating, shouldRender, isClosing } = useModalAnimation(open);
  useModalScrollLock(open);

  useEscapeKey(onClose, open);

  if (!shouldRender) return null;

  const handleAddAddress = async () => {
    const success = await onAddAddress();
    if (success) onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-add-title"
      className={[
        'fixed inset-0 flex p-4 bg-black/40 backdrop-blur-sm',
        'items-end sm:items-center',
        isAnimating ? 'modal-backdrop-enter' : isClosing ? 'modal-backdrop-exit' : 'opacity-0',
      ].join(' ')}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={[
          'relative w-full max-w-xl mx-auto bg-bg-surface border border-border-default shadow-2xl',
          'rounded-t-2xl sm:rounded-2xl',
          'p-6 sm:p-8',
          isAnimating ? 'modal-content-enter' : isClosing ? 'modal-content-exit' : '',
        ].join(' ')}
      >
        <ModalCloseButton onClose={onClose} />
        <h2 id="address-add-title" className="mb-2 text-2xl font-bold text-text-primary">
          {t('user.address.add')}
        </h2>
        <p className="mb-6 text-sm text-text-tertiary">
          {t('user.address.addModalDescription', {
            current: addresses.length,
            remaining: Math.max(0, 4 - addresses.length),
          })}
          <br />
          <span className="text-xs text-text-placeholder">{t('user.address.addModalNote')}</span>
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

          {selectedAddress && (
            <div data-testid="selected-address" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-3">
                <p className="text-xs font-medium text-emerald-300">{t('user.address.selected')}</p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {selectedAddress.roadAddress || selectedAddress.address}
                </p>
                {selectedAddress.roadAddress && (
                  <p className="mt-0.5 text-xs text-text-tertiary">{selectedAddress.address}</p>
                )}
              </div>
              <input
                type="text"
                value={addressAlias}
                onChange={(e) => onAddressAliasChange(e.target.value)}
                placeholder={t('user.address.aliasPlaceholder')}
                maxLength={20}
                className="w-full rounded-xl border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <button
                onClick={onClearSelection}
                className="mt-2 text-xs text-red-400 transition hover:text-red-300"
              >
                {t('user.address.clearSelection')}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              size="lg"
              disabled={isSaving}
              className="flex-1 border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddAddress}
              isLoading={isSaving}
              disabled={!selectedAddress || addresses.length >= 4}
              className="flex-1 bg-gradient-to-r from-brand-primary to-rose-500 text-text-inverse shadow-md shadow-brand-primary/30"
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
