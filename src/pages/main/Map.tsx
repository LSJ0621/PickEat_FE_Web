/**
 * Google 지도 페이지
 * 선택한 가게 또는 전체 가게 위치를 지도에 표시합니다.
 */

import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/common/PageContainer';
import { useGoogleMap } from '@/hooks/map/useGoogleMap';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import type { Restaurant } from '@/types/search';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, RefreshCw } from 'lucide-react';

interface MapPageState {
  restaurants?: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  menuName?: string | null;
}

export const MapPage = () => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const { latitude, longitude, address, hasLocation } = useUserLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    restaurants = [],
    selectedRestaurant = null,
    menuName = null,
  } = (location.state as MapPageState) || {};

  const hasRestaurantData = restaurants.length > 0;
  const hasAnyLocation = hasRestaurantData || hasLocation;

  const blockingError = useMemo(() => {
    if (!hasAnyLocation) {
      return t('map.noLocationError');
    }
    return null;
  }, [hasAnyLocation, t]);

  const userLatLng =
    hasLocation && latitude !== null && longitude !== null ? { latitude, longitude } : null;

  const { loading, runtimeError } = useGoogleMap({
    mapRef,
    restaurants,
    selectedRestaurant,
    userLatLng,
    blockingError,
  });

  const error = blockingError ?? runtimeError;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!hasAnyLocation) {
    return (
      <PageContainer maxWidth="max-w-6xl">
        <div className="rounded-3xl border border-border-default bg-bg-surface p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-semibold text-text-primary">{t('map.noLocationData')}</h2>
          <p className="mt-3 text-text-secondary">{t('map.noLocationDataDesc')}</p>
          <Button className="mt-6" variant="primary" size="md" onClick={() => navigate('/')}>
            {t('navigation.backToHome')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-300/25 via-orange-200/15 to-amber-100/10 blur-3xl" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-orange-200/15 via-amber-100/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 border-b border-border-default bg-bg-primary/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-text-primary"
                aria-label={t('navigation.back')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('navigation.back')}</span>
              </Button>

              <div className="h-4 w-px bg-border-default" />

              <div>
                <p className="text-sm font-semibold text-text-primary sm:text-base">
                  {t('map.title')}
                </p>
                {menuName && (
                  <p className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Store className="h-3 w-3" />
                    {menuName} · {restaurants.length}
                    {t('map.stores')}
                  </p>
                )}
                {!menuName && hasRestaurantData && (
                  <p className="text-xs text-text-tertiary">
                    {t('map.totalStores', { count: restaurants.length })}
                  </p>
                )}
                {!hasRestaurantData && address && (
                  <p className="flex items-center gap-1 text-xs text-text-tertiary">
                    <MapPin className="h-3 w-3" />
                    {address}
                  </p>
                )}
              </div>
            </div>

            {selectedRestaurant && (
              <div className="hidden items-center gap-1.5 rounded-full border border-border-default px-4 py-1 text-xs text-text-secondary sm:flex">
                <MapPin className="h-3 w-3 text-brand-primary/70" />
                {t('map.selected')}: {selectedRestaurant.name}
              </div>
            )}
          </div>
        </header>

        <main className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-primary/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
                <p className="text-sm text-text-secondary">{t('map.loadingMap')}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg-primary/70 backdrop-blur-sm">
              <div className="mx-4 max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center shadow-2xl">
                <h3 className="mb-2 text-lg font-semibold text-red-500">
                  {t('map.errorOccurred')}
                </h3>
                <p className="mb-4 text-sm text-text-secondary">{error}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t('map.refresh')}
                </Button>
              </div>
            </div>
          )}
          <div ref={mapRef} className="h-[calc(100vh-57px)] min-h-[600px] w-full sm:h-[calc(100vh-65px)]" />
        </main>
      </div>
    </div>
  );
};
