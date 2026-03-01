import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { shallowEqual } from 'react-redux';
import { Button } from '@shared/components/Button';
import { PageContainer } from '@shared/components/PageContainer';
import { MenuRecommendation } from '@features/agent/components/menu/MenuRecommendation';
import { ResultsSection } from '@features/agent/components/ResultsSection';
import { useScrollToSection } from '@shared/hooks/useScrollToSection';
import { useUserLocation } from '@features/map/hooks/useUserLocation';
import { useAgentActions } from '@features/agent/hooks/useAgentActions';
import { useConfirmModal } from '@features/agent/hooks/useConfirmModal';
import { usePlaceSelection } from '@features/agent/hooks/usePlaceSelection';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  resetAiRecommendations,
  setSelectedPlace,
} from '@app/store/slices/agentSlice';
import { useToast } from '@shared/hooks/useToast';
import type { PlaceRecommendationItem } from '@features/agent/types';
import { X } from 'lucide-react';

// Lazy load modals
const PlaceDetailsModal = lazy(() =>
  import('@features/agent/components/restaurant/PlaceDetailsModal').then((m) => ({
    default: m.PlaceDetailsModal,
  }))
);

const PlaceSelectionModal = lazy(() =>
  import('@features/agent/components/restaurant/PlaceSelectionModal').then((m) => ({
    default: m.PlaceSelectionModal,
  }))
);

export const AgentPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const userSetupInfo = useAppSelector(
    (state) => ({
      address: state.auth?.user?.address,
      preferences: state.auth?.user?.preferences,
      birthDate: state.auth?.user?.birthDate,
      gender: state.auth?.user?.gender,
    }),
    shallowEqual
  );
  const toast = useToast();
  const { latitude, longitude, address } = useUserLocation();

  const aiSectionRef = useRef<HTMLDivElement>(null);
  const hasRedirectedRef = useRef(false);

  const selectedMenu = useAppSelector((state) => state.agent.selectedMenu);
  const isSearchAiLoading = useAppSelector((state) => state.agent.isSearchAiLoading);
  const selectedPlace = useAppSelector((state) => state.agent.selectedPlace);

  const { handleMenuClick, handleCancel, handleAiRecommendation } = useAgentActions({
    latitude,
    longitude,
  });

  const { showConfirmCard } = useConfirmModal({ handleCancel });

  const placeSelection = usePlaceSelection();

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!isAuthenticated) return;

    const needsAddress = !userSetupInfo.address;
    const needsPreferences =
      !userSetupInfo.preferences ||
      (userSetupInfo.preferences.likes.length === 0 &&
        userSetupInfo.preferences.dislikes.length === 0);
    const needsBirthDate = !userSetupInfo.birthDate;
    const needsGender = !userSetupInfo.gender;
    const needsSetup = needsAddress || needsPreferences || needsBirthDate || needsGender;

    if (needsSetup) {
      hasRedirectedRef.current = true;
      toast.warning(t('agent.needsSetupRedirect'));
      navigate('/mypage', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast is stable and doesn't need to be in deps; hasRedirectedRef prevents duplicate runs
  }, [isAuthenticated, userSetupInfo.address, userSetupInfo.preferences, userSetupInfo.birthDate, userSetupInfo.gender, navigate, t]);

  useScrollToSection({
    elementRef: aiSectionRef,
    shouldScroll: isSearchAiLoading && selectedMenu !== null,
    offset: 80,
  });

  const hasAiQueryContext = Boolean(
    address?.trim() || (latitude !== null && longitude !== null)
  );

  const onSelectPlace = useCallback(
    (recommendation: PlaceRecommendationItem) => {
      dispatch(setSelectedPlace(recommendation));
    },
    [dispatch]
  );

  const onResetAiRecommendations = useCallback(() => {
    dispatch(resetAiRecommendations());
  }, [dispatch]);

  return (
    <PageContainer maxWidth="max-w-6xl">
      {/* Hero Section */}
      <section className="mb-6 rounded-2xl border border-border-default bg-bg-surface p-6 text-center shadow-2xl shadow-orange-500/10 sm:mb-8 sm:rounded-[32px] sm:p-8 lg:mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-600 sm:text-sm sm:tracking-[0.4em]">
          {t('agent.smartCompanion')}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-primary sm:mt-3 sm:text-2xl md:mt-4 md:text-3xl lg:text-4xl">
          {t('agent.title')}
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            {' '}
            {t('agent.subtitle')}
          </span>
        </h2>
        <p className="mx-auto mt-1.5 max-w-3xl text-xs text-text-secondary sm:mt-2 sm:text-sm md:mt-3 md:text-base">
          {t('agent.description')}
        </p>
        {!isAuthenticated && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-4 lg:mt-8">
            <Button size="md" onClick={() => navigate('/login')} className="sm:size-lg">
              {t('agent.loginToGetRecommendation')}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/login')}
              className="sm:size-lg"
            >
              {t('agent.quickStartWithKakao')}
            </Button>
          </div>
        )}
      </section>

      {!isAuthenticated ? (
        <div className="rounded-3xl border border-border-default bg-bg-secondary p-8 text-center shadow-xl shadow-black/10">
          <h3 className="text-2xl font-semibold text-text-primary">{t('agent.loginRequired')}</h3>
          <p className="mt-3 text-text-secondary">{t('agent.loginRequiredDesc')}</p>
          <Button
            className="mt-6"
            size="md"
            variant="secondary"
            onClick={() => navigate('/login')}
          >
            {t('agent.goToLogin')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:gap-8">
          <MenuRecommendation onMenuSelect={handleMenuClick} selectedMenu={selectedMenu} />
          <ResultsSection
            selectedMenu={selectedMenu}
            onSelectPlace={onSelectPlace}
            onResetAiRecommendations={onResetAiRecommendations}
            aiSectionRef={aiSectionRef}
            onOpenPlaceSelection={placeSelection.hasPlaces ? placeSelection.openModal : undefined}
          />
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmCard && selectedMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div
            data-testid="menu-selection-modal"
            className="relative w-full max-w-md rounded-[32px] border border-border-default bg-bg-surface p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              data-testid="modal-close-button"
              onClick={handleCancel}
              className="absolute right-6 top-6 rounded-full p-1 text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-4">
              <p className="text-center text-lg text-text-primary">
                <span
                  data-testid="selected-menu-name"
                  className="font-semibold text-brand-primary"
                >
                  {selectedMenu}
                </span>
                {t('agent.confirmAiRecommendation')}
              </p>
              <Button
                onClick={handleAiRecommendation}
                variant="primary"
                size="lg"
                disabled={!hasAiQueryContext}
                className="w-full"
              >
                {t('common.confirm')}
              </Button>
            </div>
            {!hasAiQueryContext && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-700">
                {t('agent.needsAddressForAi')}
              </div>
            )}
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <PlaceDetailsModal
          placeId={selectedPlace?.placeId ?? null}
          placeName={selectedPlace?.name ?? null}
          localizedName={selectedPlace?.localizedName ?? null}
          searchName={selectedPlace?.searchName ?? null}
          searchAddress={selectedPlace?.searchAddress ?? null}
          onClose={() => dispatch(setSelectedPlace(null))}
        />
        <PlaceSelectionModal
          open={placeSelection.isModalOpen}
          searchPlaces={placeSelection.searchPlaces}
          communityPlaces={placeSelection.communityPlaces}
          onClose={placeSelection.closeModal}
          onSelect={placeSelection.handleSelectPlace}
          isSelecting={placeSelection.isSelecting}
        />
      </Suspense>
    </PageContainer>
  );
};
