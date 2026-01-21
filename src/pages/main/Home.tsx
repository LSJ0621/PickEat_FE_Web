import { HomeCTA, HomeFeatures, HomeHero, HomeHighlights, HomeHowItWorks } from '@/components/features/home';

export const HomePage = () => {

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
    </div>
  );
};
