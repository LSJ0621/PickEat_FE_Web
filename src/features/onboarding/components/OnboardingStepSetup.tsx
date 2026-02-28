/**
 * OnboardingStepSetup 컴포넌트
 * 온보딩 Step 4: 초기 설정 (주소 + 취향)
 * InitialSetupAddressSection, InitialSetupPreferencesSection 재사용
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { InitialSetupAddressSection } from '@features/user/components/setup/InitialSetupAddressSection';
import { InitialSetupPreferencesSection } from '@features/user/components/setup/InitialSetupPreferencesSection';
import { useAppSelector, useAppDispatch } from '@app/store/hooks';
import { checkUserSetupStatus } from '@shared/utils/userSetup';
import type { SelectedAddress } from '@features/user/types';
import { userService } from '@features/user/api';
import { updateUser } from '@app/store/slices/authSlice';
import { invalidateAddresses, invalidatePreferences } from '@app/store/slices/userDataSlice';
import { extractErrorMessage } from '@shared/utils/error';
import { useToast } from '@shared/hooks';

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
      })
    : { needsAddress: true, needsPreferences: true, needsName: false, hasAnyMissing: true };

  const alreadySetup = !setupStatus.needsAddress && !setupStatus.needsPreferences;

  const [isSaving, setIsSaving] = useState(false);

  // Local state for address setup
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');

  // Local state for preferences setup
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);

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
        // useAddressModal은 addressesCount===0 가드를 추가하지만 여기선 불필요
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

      onNext();
    } catch (error) {
      toast(extractErrorMessage(error, t('onboarding.step4.saveError')), 'error');
    } finally {
      setIsSaving(false);
    }
  }, [selectedAddress, addressAlias, likes, dislikes, dispatch, onNext, toast, t]);

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
          {isSaving ? t('common.saving') : t('onboarding.next')}
        </button>
      </div>
    </div>
  );
}
