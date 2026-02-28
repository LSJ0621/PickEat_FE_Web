/**
 * User Place 등록/수정 폼 컴포넌트
 */

import { Button } from '@shared/components/Button';
import { UserPlaceImageUploader } from './UserPlaceImageUploader';
import { UserPlaceAddressField } from './UserPlaceAddressField';
import { UserPlaceMenuTypesField } from './UserPlaceMenuTypesField';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { useAddressSearch } from '@shared/hooks/address/useAddressSearch';
import type { CreateUserPlaceRequest, UpdateUserPlaceRequest, UserPlace } from '@features/user-place/types';
import { USER_PLACE_CATEGORIES } from '@features/user-place/types';
import { USER_PLACE } from '@shared/utils/constants';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserPlaceFormProps {
  initialData?: UserPlace;
  onSubmit: (data: CreateUserPlaceRequest | UpdateUserPlaceRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function UserPlaceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel,
}: UserPlaceFormProps) {
  const { t } = useTranslation();
  const {
    addressQuery,
    searchResults,
    isSearching,
    selectedAddress,
    setAddressQuery,
    handleSearch,
    handleSelectAddress,
    clearSearch,
    setSelectedAddress,
  } = useAddressSearch();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [menuTypes, setMenuTypes] = useState<string[]>([]);
  const [menuInput, setMenuInput] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [openingHours, setOpeningHours] = useState('');

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData.name);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhoneNumber(initialData.phoneNumber || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(initialData.category || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDescription(initialData.description || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMenuTypes(initialData.menuTypes || []);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingPhotos(initialData.photos || []);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewImages([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpeningHours(initialData.openingHours || '');
      setSelectedAddress({
        address: initialData.address,
        roadAddress: initialData.address,
        postalCode: null,
        latitude: initialData.latitude.toString(),
        longitude: initialData.longitude.toString(),
      });
    }
  }, [initialData, setSelectedAddress]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAddress) return;

      const baseData = {
        name: name.trim(),
        address: selectedAddress.roadAddress || selectedAddress.address,
        latitude: parseFloat(selectedAddress.latitude),
        longitude: parseFloat(selectedAddress.longitude),
        phoneNumber: phoneNumber.trim() || undefined,
        category: category || undefined,
        description: description.trim() || undefined,
        menuTypes,
        existingPhotos: existingPhotos.length > 0 ? existingPhotos : undefined,
        images: newImages.length > 0 ? newImages : undefined,
        openingHours: openingHours.trim() || undefined,
      };

      if (initialData) {
        onSubmit({ ...baseData, version: initialData.version });
      } else {
        onSubmit(baseData);
      }
    },
    [name, selectedAddress, phoneNumber, category, description, menuTypes, existingPhotos, newImages, openingHours, initialData, onSubmit]
  );

  const canSubmit = name.trim() && selectedAddress && menuTypes.length >= 1;

  const handleAddMenu = useCallback(() => {
    const trimmed = menuInput.trim();
    if (trimmed && menuTypes.length < 10 && !menuTypes.includes(trimmed)) {
      setMenuTypes([...menuTypes, trimmed]);
      setMenuInput('');
    }
  }, [menuInput, menuTypes]);

  const handleRemoveMenu = useCallback((index: number) => {
    setMenuTypes(menuTypes.filter((_, i) => i !== index));
  }, [menuTypes]);

  const handleExistingPhotoRemove = useCallback((url: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  }, []);

  const handleNewImagesAdd = useCallback((files: File[]) => {
    setNewImages((prev) => [...prev, ...files]);
  }, []);

  const handleNewImageRemove = useCallback((index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 가게명 */}
      <div>
        <Label className="mb-2 block text-sm font-semibold text-text-primary">
          {t('userPlace.name')} <span className="text-red-400">*</span>
        </Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="rounded-2xl"
          placeholder={t('userPlace.namePlaceholder')}
          required
        />
      </div>

      {/* 주소 검색 */}
      <UserPlaceAddressField
        selectedAddress={selectedAddress}
        addressQuery={addressQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        onQueryChange={setAddressQuery}
        onSearch={() => void handleSearch()}
        onSelectAddress={handleSelectAddress}
        onReset={() => {
          setSelectedAddress(null);
          clearSearch();
        }}
      />

      {/* 전화번호 */}
      <div>
        <Label className="mb-2 block text-sm font-semibold text-text-primary">
          {t('userPlace.phoneNumber')}
        </Label>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={20}
          className="rounded-2xl"
          placeholder={t('userPlace.phoneNumberPlaceholder')}
        />
      </div>

      {/* 카테고리 */}
      <div>
        <Label className="mb-2 block text-sm font-semibold text-text-primary">
          {t('userPlace.category')}
        </Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-2xl border border-border-default bg-bg-secondary px-4 py-3 text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          <option value="">{t('userPlace.selectCategory')}</option>
          {USER_PLACE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`userPlace.categories.${cat}`)}
            </option>
          ))}
        </select>
      </div>

      {/* 설명 */}
      <div>
        <Label className="mb-2 block text-sm font-semibold text-text-primary">
          {t('userPlace.description')}
        </Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full rounded-2xl border border-border-default bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder={t('userPlace.descriptionPlaceholder')}
        />
      </div>

      {/* 메뉴 종류 */}
      <UserPlaceMenuTypesField
        menuTypes={menuTypes}
        menuInput={menuInput}
        onMenuInputChange={setMenuInput}
        onAddMenu={handleAddMenu}
        onRemoveMenu={handleRemoveMenu}
      />

      {/* 영업시간 */}
      <div>
        <Label className="mb-2 block text-sm font-semibold text-text-primary">
          {t('userPlace.form.openingHours')}
        </Label>
        <textarea
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          maxLength={200}
          rows={2}
          className="w-full rounded-2xl border border-border-default bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder={t('userPlace.form.openingHoursPlaceholder')}
        />
      </div>

      {/* 사진 업로드 */}
      <div>
        <Label className="mb-2 block text-sm font-semibold text-text-primary">
          {t('userPlace.form.photos')}
        </Label>
        <UserPlaceImageUploader
          existingPhotos={existingPhotos}
          newImages={newImages}
          onExistingRemove={handleExistingPhotoRemove}
          onNewAdd={handleNewImagesAdd}
          onNewRemove={handleNewImageRemove}
          maxTotal={USER_PLACE.MAX_IMAGES}
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={!canSubmit}
          isLoading={isLoading}
        >
          {submitLabel || t('common.save')}
        </Button>
      </div>
    </form>
  );
}
