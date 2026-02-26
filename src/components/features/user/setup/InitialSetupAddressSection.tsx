/**
 * 초기 설정 주소 섹션 컴포넌트
 * 주소 검색 및 선택 UI를 제공합니다.
 */

import { AddressSearchInput } from './AddressSearchInput';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
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

  // 주소 선택 핸들러
  const handleSelectAddress = (address: SelectedAddress) => {
    onAddressChange(address);
    addressSearch.clearSearch();
  };

  return (
    <div className="rounded-[var(--radius-lg)] border-border-default bg-bg-secondary p-6 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{t('setup.address.title')}</h3>
        <p className="mt-1 text-sm text-text-tertiary">{t('setup.address.description')}</p>
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
          onSelectAddress={(address) => handleSelectAddress(addressSearch.handleSelectAddress(address))}
        />

        {selectedAddress && (
          <>
            <div className="rounded-[var(--radius-md)] border-status-success/30 bg-status-success/10 p-4">
              <p className="text-xs text-status-success">{t('setup.address.selected')}</p>
              <p className="mt-1 text-text-primary font-medium">
                {selectedAddress.roadAddress || selectedAddress.address}
              </p>
            </div>

            {/* 별칭 입력 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                {t('setup.address.alias')}
              </label>
              <input
                type="text"
                value={addressAlias}
                onChange={(e) => onAddressAliasChange(e.target.value)}
                placeholder={t('setup.address.aliasPlaceholder')}
                maxLength={20}
                className="w-full rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-3 text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

