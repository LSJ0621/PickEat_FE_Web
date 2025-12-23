import { lazy, Suspense, useEffect, useState } from 'react';
import { HomeCTA, HomeFeatures, HomeHero, HomeHighlights, HomeHowItWorks } from '@/components/features/home';
import { useAppSelector } from '@/store/hooks';
import { checkUserSetupStatus } from '@/utils/userSetup';

// Lazy load modals
const InitialSetupModal = lazy(() => import('@/components/features/user/setup/InitialSetupModal').then(m => ({ default: m.InitialSetupModal })));
const AddressRegistrationModal = lazy(() => import('@/components/features/user/setup/AddressRegistrationModal').then(m => ({ default: m.AddressRegistrationModal })));

export const HomePage = () => {
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [setupStatus, setSetupStatus] = useState<ReturnType<typeof checkUserSetupStatus> | null>(null);

  // 로그인 상태일 때 필요한 정보 체크
  useEffect(() => {
    if (isAuthenticated && user) {
      const status = checkUserSetupStatus(user);

      // 주소만 없으면 주소 등록 모달 표시
      if (status.needsAddress && !status.needsName && !status.needsPreferences) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowAddressModal(true);
      } else if (status.hasAnyMissing) {
        // 이름이나 취향도 필요한 경우 초기 설정 모달 표시
        setSetupStatus(status);
        setShowSetupModal(true);
      }
    }
  }, [isAuthenticated, user]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* 배경 그라데이션 애니메이션 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10">
        {/* 히어로 섹션 */}
        <HomeHero />

        {/* 기능 소개 섹션 */}
        <HomeFeatures />

        {/* 작동 방식 섹션 */}
        <HomeHowItWorks />

        {/* 주요 기능 하이라이트 */}
        <HomeHighlights />

        {/* 최종 CTA 섹션 */}
        <HomeCTA />
      </div>

      {/* 모달들 */}
      {setupStatus && (
        <Suspense fallback={null}>
          <InitialSetupModal
            open={showSetupModal}
            setupStatus={setupStatus}
            onComplete={() => {
              setShowSetupModal(false);
              setSetupStatus(null);
            }}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <AddressRegistrationModal
          open={showAddressModal}
          onComplete={() => {
            setShowAddressModal(false);
          }}
        />
      </Suspense>
    </div>
  );
};
