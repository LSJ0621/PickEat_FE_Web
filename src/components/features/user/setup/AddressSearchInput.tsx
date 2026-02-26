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
        className="flex-1 rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-3 text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
      />
      <Button onClick={onSearch} isLoading={isSearching} size="md" variant="primary">
        {t('setup.search')}
      </Button>
    </div>
  );
};

