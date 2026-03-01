/**
 * OnboardingStepSetup 컴포넌트
 * 온보딩 Step 4: 초기 설정 (주소 + 취향 + 생년월일/성별)
 * InitialSetupAddressSection, InitialSetupPreferencesSection 재사용
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { InitialSetupAddressSection } from '@features/user/components/setup/InitialSetupAddressSection';
import { InitialSetupPreferencesSection } from '@features/user/components/setup/InitialSetupPreferencesSection';
import { ScrollDatePicker } from '@shared/components/ScrollDatePicker';
import { useAppSelector, useAppDispatch } from '@app/store/hooks';
import { checkUserSetupStatus } from '@shared/utils/userSetup';
import type { SelectedAddress } from '@features/user/types';
import { userService } from '@features/user/api';
import { authService } from '@features/auth/api';
import { updateUser } from '@app/store/slices/authSlice';
import { invalidateAddresses, invalidatePreferences } from '@app/store/slices/userDataSlice';
import { extractErrorMessage } from '@shared/utils/error';
import { useToast } from '@shared/hooks';

const GENDER_OPTIONS: { value: 'male' | 'female' | 'other'; labelKey: string }[] = [
  { value: 'male', labelKey: 'user.profile.genderMale' },
  { value: 'female', labelKey: 'user.profile.genderFemale' },
  { value: 'other', labelKey: 'user.profile.genderOther' },
];

interface OnboardingStepSetupProps {
  onNext: () => void;
  onPrev: () => void;
}

export function OnboardingStepSetup({ onNext, onPrev }: OnboardingStepSetupProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth?.user);

  const setupStatus = user
    ? checkUserSetupStatus({
        name: user.name,
        address: user.address,
        preferences: user.preferences
          ? { likes: user.preferences.likes ?? [], dislikes: user.preferences.dislikes ?? [] }
          : null,
        birthDate: user.birthDate,
        gender: user.gender,
      })
    : {
        needsAddress: true,
        needsPreferences: true,
        needsName: false,
        needsBirthDate: true,
        needsGender: true,
        hasAnyMissing: true,
      };

  const alreadySetup =
    !setupStatus.needsAddress &&
    !setupStatus.needsPreferences &&
    !setupStatus.needsBirthDate &&
    !setupStatus.needsGender;

  const [isSaving, setIsSaving] = useState(false);

  // Local state for address setup
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');

  // Local state for preferences setup
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);

  // Local state for birthDate/gender
  const [birthDate, setBirthDate] = useState<string | null>(user?.birthDate ?? null);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(user?.gender ?? null);

  const handleAddressChange = useCallback((address: SelectedAddress | null) => {
    setSelectedAddress(address);
  }, []);

  const handleAddressAliasChange = useCallback((alias: string) => {
    setAddressAlias(alias);
  }, []);

  const handleLikesChange = useCallback((newLikes: string[]) => {
    setLikes(newLikes);
  }, []);

  const handleDislikesChange = useCallback((newDislikes: string[]) => {
    setDislikes(newDislikes);
  }, []);

  const handleNext = useCallback(async () => {
    setIsSaving(true);
    try {
      if (selectedAddress) {
        const createdAddress = await userService.createAddress({
          selectedAddress,
          alias: addressAlias.trim() || undefined,
        });
        // 온보딩은 첫 로그인 유저만 거치므로 항상 첫 주소 → isDefault=true
        if (createdAddress.isDefault) {
          dispatch(updateUser({
            address: createdAddress.roadAddress,
            latitude: createdAddress.latitude,
            longitude: createdAddress.longitude,
          }));
        }
        dispatch(invalidateAddresses());
      }

      if (likes.length > 0 || dislikes.length > 0) {
        const prefsResponse = await userService.setPreferences({ likes, dislikes });
        dispatch(updateUser({ preferences: prefsResponse.preferences }));
        dispatch(invalidatePreferences());
      }

      // 생년월일/성별이 입력된 경우 업데이트
      const needsBirthDateUpdate = setupStatus.needsBirthDate && birthDate;
      const needsGenderUpdate = setupStatus.needsGender && gender;
      if (needsBirthDateUpdate || needsGenderUpdate) {
        const updatePayload: { birthDate?: string; gender?: 'male' | 'female' | 'other' } = {};
        if (needsBirthDateUpdate && birthDate) {
          updatePayload.birthDate = birthDate;
        }
        if (needsGenderUpdate && gender) {
          updatePayload.gender = gender;
        }
        const updatedUser = await authService.updateUser(updatePayload);
        dispatch(updateUser({
          birthDate: updatedUser.birthDate ?? undefined,
          gender: updatedUser.gender ?? undefined,
        }));
      }

      onNext();
    } catch (error) {
      toast(extractErrorMessage(error, t('onboarding.step4.saveError')), 'error');
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedAddress,
    addressAlias,
    likes,
    dislikes,
    birthDate,
    gender,
    setupStatus.needsBirthDate,
    setupStatus.needsGender,
    dispatch,
    onNext,
    toast,
    t,
  ]);

  if (alreadySetup) {
    return (
      <div className="flex flex-col px-2 py-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-text-primary">
            {t('onboarding.step4.title')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('onboarding.step4.subtitle')}
          </p>
        </div>

        {/* Already configured message */}
        <div className="mb-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8">
          <CheckCircle className="h-12 w-12 text-emerald-400" aria-hidden="true" />
          <div className="text-center">
            <p className="font-semibold text-emerald-400">{t('onboarding.step4.alreadySetupTitle')}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {t('onboarding.step4.alreadySetupDesc')}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 rounded-xl border border-border-default bg-transparent py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {t('onboarding.prev')}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all hover:shadow-orange-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            {t('onboarding.next')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-2 py-4">
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          {t('onboarding.step4.title')}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t('onboarding.step4.subtitle')}
        </p>
      </div>

      {/* Scrollable setup sections */}
      <div className="mb-4 max-h-[45vh] overflow-y-auto space-y-4 pr-1 -mr-1">
        {setupStatus.needsAddress && (
          <InitialSetupAddressSection
            selectedAddress={selectedAddress}
            addressAlias={addressAlias}
            onAddressChange={handleAddressChange}
            onAddressAliasChange={handleAddressAliasChange}
          />
        )}
        {setupStatus.needsPreferences && (
          <InitialSetupPreferencesSection
            likes={likes}
            dislikes={dislikes}
            onLikesChange={handleLikesChange}
            onDislikesChange={handleDislikesChange}
          />
        )}

        {/* 생년월일 / 성별 섹션 - OAuth 유저 등 미설정 시에만 표시 */}
        {(setupStatus.needsBirthDate || setupStatus.needsGender) && (
          <div className="space-y-4 rounded-2xl border border-border-default bg-bg-surface p-4">
            {setupStatus.needsBirthDate && (
              <div>
                <label className="mb-3 block text-sm font-medium text-text-primary">
                  {t('user.profile.birthDate')}
                </label>
                <ScrollDatePicker
                  value={birthDate}
                  onChange={(value) => setBirthDate(value)}
                />
              </div>
            )}

            {setupStatus.needsGender && (
              <fieldset>
                <legend className="mb-3 block text-sm font-medium text-text-primary">
                  {t('user.profile.gender')}
                </legend>
                <div className="space-y-2" role="radiogroup">
                  {GENDER_OPTIONS.map(({ value, labelKey }) => (
                    <label
                      key={value}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                        gender === value
                          ? 'border-brand-primary/50 bg-brand-primary/10'
                          : 'border-border-default bg-bg-secondary hover:bg-bg-hover',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="onboarding-gender"
                        value={value}
                        checked={gender === value}
                        onChange={() => setGender(value)}
                        className="h-4 w-4 accent-brand-primary"
                      />
                      <span className="text-sm text-text-primary">{t(labelKey)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        )}
      </div>

      {/* Skip note */}
      <p className="mb-4 text-center text-xs text-text-tertiary">
        {t('onboarding.step4.skipNote')}
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 rounded-xl border border-border-default bg-transparent py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {t('onboarding.prev')}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSaving}
          className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all hover:shadow-orange-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? t('user.profile.saving') : t('onboarding.next')}
        </button>
      </div>
    </div>
  );
}
