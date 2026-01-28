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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{t('setup.address.title')}</h3>
        <p className="mt-1 text-sm text-slate-400">{t('setup.address.description')}</p>
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
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs text-emerald-200">{t('setup.address.selected')}</p>
              <p className="mt-1 text-white font-medium">
                {selectedAddress.roadAddress || selectedAddress.address}
              </p>
            </div>

            {/* 별칭 입력 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                {t('setup.address.alias')}
              </label>
              <input
                type="text"
                value={addressAlias}
                onChange={(e) => onAddressAliasChange(e.target.value)}
                placeholder={t('setup.address.aliasPlaceholder')}
                maxLength={20}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

