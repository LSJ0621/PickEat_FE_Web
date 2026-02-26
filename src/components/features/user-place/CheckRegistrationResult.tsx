/**
 * 등록 전 확인 결과 표시 컴포넌트
 */

import type { CheckRegistrationResponse } from '@/types/user-place';
import { useTranslation } from 'react-i18next';

interface CheckRegistrationResultProps {
  result: CheckRegistrationResponse;
}

export function CheckRegistrationResult({ result }: CheckRegistrationResultProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 rounded-2xl border border-border-default bg-bg-secondary p-6">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-text-primary">
          {t('userPlace.dailyRemaining')}
        </span>
        <span className="text-2xl font-bold text-brand-primary">
          {result.dailyRemaining}
        </span>
      </div>

      {result.duplicateExists && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm font-semibold text-red-300">
            {t('userPlace.duplicateWarning')}
          </p>
        </div>
      )}

      {result.nearbyPlaces.length > 0 && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
          <p className="mb-3 text-sm font-semibold text-yellow-300">
            {t('userPlace.nearbyWarning')}
          </p>
          <ul className="space-y-2">
            {result.nearbyPlaces.map((place) => (
              <li
                key={place.id}
                className="text-sm text-text-secondary"
              >
                <span className="font-medium">{place.name}</span>
                <span className="text-text-tertiary"> - {place.address}</span>
                <span className="text-text-placeholder"> ({place.distance.toFixed(0)}m)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.canRegister && !result.duplicateExists && result.nearbyPlaces.length === 0 && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm font-semibold text-green-300">
            {t('userPlace.canRegister')}
          </p>
        </div>
      )}
    </div>
  );
}
