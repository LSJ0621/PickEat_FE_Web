/**
 * 주소 검색 입력 컴포넌트
 * 주소 검색 입력 필드와 검색 버튼을 제공합니다.
 */

import { Button } from '@/components/common/Button';
import { useTranslation } from 'react-i18next';

interface AddressSearchInputProps {
  addressQuery: string;
  isSearching: boolean;
  onAddressQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export const AddressSearchInput = ({
  addressQuery,
  isSearching,
  onAddressQueryChange,
  onSearch,
  placeholder,
}: AddressSearchInputProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={addressQuery}
        onChange={(e) => onAddressQueryChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isSearching) {
            onSearch();
          }
        }}
        placeholder={placeholder || t('setup.address.searchPlaceholder')}
        className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
      />
      <Button onClick={onSearch} isLoading={isSearching} size="md">
        {t('setup.search')}
      </Button>
    </div>
  );
};

