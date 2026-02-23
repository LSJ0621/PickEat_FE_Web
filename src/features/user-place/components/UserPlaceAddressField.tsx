/**
 * User Place 주소 검색 필드 컴포넌트
 */

import { Button } from '@shared/components/Button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import type { AddressSearchResult, SelectedAddress } from '@features/user/types';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserPlaceAddressFieldProps {
  selectedAddress: SelectedAddress | null;
  addressQuery: string;
  searchResults: AddressSearchResult[];
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onSelectAddress: (result: AddressSearchResult) => void;
  onReset: () => void;
}

export function UserPlaceAddressField({
  selectedAddress,
  addressQuery,
  searchResults,
  isSearching,
  onQueryChange,
  onSearch,
  onSelectAddress,
  onReset,
}: UserPlaceAddressFieldProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Label className="mb-2 block text-sm font-semibold text-text-primary">
        {t('userPlace.address')} <span className="text-red-400">*</span>
      </Label>
      {selectedAddress ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-sm font-medium text-green-300">
              {selectedAddress.roadAddress || selectedAddress.address}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            {t('common.reset')}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              type="text"
              value={addressQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearch();
                }
              }}
              className="flex-1 rounded-2xl"
              placeholder={t('userPlace.addressPlaceholder')}
            />
            <Button
              type="button"
              variant="primary"
              onClick={onSearch}
              isLoading={isSearching}
            >
              {t('common.search')}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-2xl border border-border-default bg-bg-secondary">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectAddress(result)}
                  className="w-full border-b border-border-light px-4 py-3 text-left transition-colors hover:bg-bg-hover last:border-b-0"
                >
                  <p className="text-sm font-medium text-text-primary">
                    {result.roadAddress || result.address}
                  </p>
                  {result.roadAddress && (
                    <p className="mt-1 text-xs text-text-tertiary">{result.address}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
