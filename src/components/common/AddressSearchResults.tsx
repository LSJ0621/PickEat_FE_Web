/**
 * 주소 검색 결과 컴포넌트
 * 주소 검색 결과 리스트를 표시합니다.
 */

import type { AddressSearchResult } from '@/types/user';
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
      <div data-testid="address-search-results" className={`${maxHeight} space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-800/50 p-4`}>
        {searchResults.map((address, index) => (
          <button
            key={index}
            onClick={() => onSelectAddress(address)}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm text-white transition hover:bg-white/10"
          >
            <p className="font-medium">{address.roadAddress || address.address}</p>
            {address.roadAddress && (
              <p className="mt-1 text-xs text-slate-400">{address.address}</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (!isSearching && hasSearchedAddress && searchResults.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage || t('setup.address.notFound')}</p>;
  }

  return null;
};

