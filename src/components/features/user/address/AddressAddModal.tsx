import { useTranslation } from 'react-i18next';
import { AddressSearchInput } from '@/components/features/user/setup/AddressSearchInput';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { AddressSearchResult, SelectedAddress, UserAddress } from '@/types/user';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div 
        className={`relative w-full max-w-xl rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} />
        <h2 className="mb-6 text-2xl font-bold text-white">{t('user.address.add')}</h2>
        <p className="mb-4 text-sm text-slate-400">
          {t('user.address.addModalDescription', { current: addresses.length, remaining: Math.max(0, 4 - addresses.length) })}
          <br />
          <span className="text-xs text-slate-500">{t('user.address.addModalNote')}</span>
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
            <div data-testid="selected-address" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-3">
                <p className="text-xs text-emerald-200">{t('user.address.selected')}</p>
                <p className="mt-1 text-white font-medium">
                  {selectedAddress.roadAddress || selectedAddress.address}
                </p>
                {selectedAddress.roadAddress && (
                  <p className="mt-1 text-xs text-slate-400">{selectedAddress.address}</p>
                )}
              </div>
              <input
                type="text"
                value={addressAlias}
                onChange={(e) => onAddressAliasChange(e.target.value)}
                placeholder={t('user.address.aliasPlaceholder')}
                maxLength={20}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              <button
                onClick={onClearSelection}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
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
              className="flex-1 border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddAddress}
              isLoading={isSaving}
              disabled={!selectedAddress || addresses.length >= 4}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
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

