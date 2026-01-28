/**
 * User Place 등록/수정 폼 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { UserPlaceImageUploader } from '@/components/features/user-place/UserPlaceImageUploader';
import { useAddressSearch } from '@/hooks/address/useAddressSearch';
import type { CreateUserPlaceRequest, UpdateUserPlaceRequest, UserPlace } from '@/types/user-place';
import { USER_PLACE_CATEGORIES } from '@/types/user-place';
import { USER_PLACE } from '@/utils/constants';
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

  // 초기 데이터 설정
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
      setNewImages([]); // 수정 모드 진입 시 새 이미지 초기화
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

      if (!selectedAddress) {
        return;
      }

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

      // 수정 모드일 때 version 필드 포함
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
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.name')} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          placeholder={t('userPlace.namePlaceholder')}
          required
        />
      </div>

      {/* 주소 검색 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.address')} <span className="text-red-400">*</span>
        </label>
        {selectedAddress ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <p className="text-sm font-medium text-green-300">
                {selectedAddress.roadAddress || selectedAddress.address}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAddress(null);
                clearSearch();
              }}
            >
              {t('common.reset')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSearch();
                  }
                }}
                className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                placeholder={t('userPlace.addressPlaceholder')}
              />
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleSearch()}
                isLoading={isSearching}
              >
                {t('common.search')}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-slate-800/50">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAddress(result)}
                    className="w-full border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-white">
                      {result.roadAddress || result.address}
                    </p>
                    {result.roadAddress && (
                      <p className="mt-1 text-xs text-slate-400">{result.address}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 전화번호 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.phoneNumber')}
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={20}
          className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          placeholder={t('userPlace.phoneNumberPlaceholder')}
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.category')}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
        >
          <option value="">{t('userPlace.selectCategory')}</option>
          {USER_PLACE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.description')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          placeholder={t('userPlace.descriptionPlaceholder')}
        />
      </div>

      {/* 메뉴 종류 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.form.menuTypes')} <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={menuInput}
            onChange={(e) => setMenuInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMenu();
              }
            }}
            maxLength={30}
            className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
            placeholder={t('userPlace.form.menuTypesPlaceholder')}
            disabled={menuTypes.length >= 10}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddMenu}
            disabled={!menuInput.trim() || menuTypes.length >= 10}
          >
            {t('setup.preferences.add')}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {t('userPlace.form.menuTypesHint')} ({menuTypes.length}/10)
          </p>
          {menuTypes.length === 0 && (
            <p className="text-xs text-red-400">{t('userPlace.form.menuTypesRequired')}</p>
          )}
        </div>
        {menuTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {menuTypes.map((menu, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRemoveMenu(idx)}
                className="group flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-300 transition-colors hover:bg-orange-500/30"
              >
                {menu}
                <span className="text-orange-400 group-hover:text-orange-200">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 영업시간 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.form.openingHours')}
        </label>
        <textarea
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          maxLength={200}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          placeholder={t('userPlace.form.openingHoursPlaceholder')}
        />
      </div>

      {/* 사진 업로드 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          {t('userPlace.form.photos')}
        </label>
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
