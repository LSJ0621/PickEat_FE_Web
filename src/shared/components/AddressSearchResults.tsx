/**
 * 주소 검색 결과 컴포넌트
 * 주소 검색 결과 리스트를 표시합니다.
 */

import type { AddressSearchResult } from '@features/user/types';
import { useTranslation } from 'react-i18next';

interface AddressSearchResultsProps {
  searchResults: AddressSearchResult[];
  isSearching: boolean;
  hasSearchedAddress: boolean;
  onSelectAddress: (address: AddressSearchResult) => void;
  maxHeight?: string;
  emptyMessage?: string;
}

export const AddressSearchResults = ({
  searchResults,
  isSearching,
  hasSearchedAddress,
  onSelectAddress,
  maxHeight = 'max-h-48',
  emptyMessage,
}: AddressSearchResultsProps) => {
  const { t } = useTranslation();
  if (searchResults.length > 0) {
    return (
      <div data-testid="address-search-results" className={`${maxHeight} space-y-2 overflow-y-auto rounded-xl border border-border-default bg-bg-secondary p-4`}>
        {searchResults.map((address) => (
          <button
            key={`${address.latitude}-${address.longitude}`}
            onClick={() => onSelectAddress(address)}
            className="w-full rounded-lg border border-border-default bg-bg-surface p-3 text-left text-sm text-text-primary transition hover:bg-bg-hover"
          >
            <p className="font-medium">{address.roadAddress || address.address}</p>
            {address.roadAddress && (
              <p className="mt-1 text-xs text-text-tertiary">{address.address}</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (!isSearching && hasSearchedAddress && searchResults.length === 0) {
    return <p className="text-sm text-text-tertiary">{emptyMessage || t('setup.address.notFound')}</p>;
  }

  return null;
};
