/**
 * 초기 설정 주소 섹션 컴포넌트
 * 주소 검색 및 선택 UI를 제공합니다.
 */

import { AddressSearchInput } from './AddressSearchInput';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
import { Input } from '@/components/ui/input';
import { useAddressSearch } from '@/hooks/address/useAddressSearch';
import type { SelectedAddress } from '@/types/user';
import { useTranslation } from 'react-i18next';

interface InitialSetupAddressSectionProps {
  selectedAddress: SelectedAddress | null;
  addressAlias: string;
  onAddressChange: (address: SelectedAddress | null) => void;
  onAddressAliasChange: (alias: string) => void;
}

export const InitialSetupAddressSection = ({
  selectedAddress,
  addressAlias,
  onAddressChange,
  onAddressAliasChange,
}: InitialSetupAddressSectionProps) => {
  const { t } = useTranslation();
  const addressSearch = useAddressSearch();

  const handleSelectAddress = (address: SelectedAddress) => {
    onAddressChange(address);
    addressSearch.clearSearch();
  };

  return (
    <div className="rounded-2xl border border-border-default bg-bg-secondary p-5">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-text-primary">
          {t('setup.address.title')}
        </h3>
        <p className="mt-1 text-xs text-text-tertiary">
          {t('setup.address.description')}
        </p>
      </div>

      <div className="space-y-3">
        <AddressSearchInput
          addressQuery={addressSearch.addressQuery}
          isSearching={addressSearch.isSearching}
          onAddressQueryChange={addressSearch.setAddressQuery}
          onSearch={addressSearch.handleSearch}
        />

        <AddressSearchResults
          searchResults={addressSearch.searchResults}
          isSearching={addressSearch.isSearching}
          hasSearchedAddress={addressSearch.hasSearchedAddress}
          onSelectAddress={(address) =>
            handleSelectAddress(addressSearch.handleSelectAddress(address))
          }
        />

        {selectedAddress && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <svg
                  className="h-3 w-3 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400">
                  {t('setup.address.selected')}
                </p>
                <p className="mt-0.5 text-sm text-text-primary font-medium">
                  {selectedAddress.roadAddress || selectedAddress.address}
                </p>
              </div>
            </div>

            {/* 별칭 입력 */}
            <div>
              <label
                htmlFor="address-alias-input"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                {t('setup.address.alias')}
              </label>
              <Input
                id="address-alias-input"
                type="text"
                value={addressAlias}
                onChange={(e) => onAddressAliasChange(e.target.value)}
                placeholder={t('setup.address.aliasPlaceholder')}
                maxLength={20}
                className="rounded-xl border-border-default bg-bg-surface
                  text-text-primary placeholder-text-placeholder
                  focus-visible:ring-brand-primary/40 focus-visible:border-border-focus
                  h-11"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
