/**
 * 홈화면 기능 소개 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';

const features = [
  {
    title: 'AI 메뉴 추천',
    description: '기분, 날씨, 취향을 반영한 메뉴를 실시간으로 제안합니다.',
    icon: '🤖',
    gradient: 'from-orange-400/20 to-rose-400/20',
  },
  {
    title: '메뉴별 가게 탐색',
    description: '원하는 메뉴를 고르면 근처 가게 후보를 AI가 선별합니다.',
    icon: '🗺️',
    gradient: 'from-blue-400/20 to-cyan-400/20',
  },
  {
    title: '히스토리 관리',
    description: '추천받은 메뉴와 가게 이력을 한눈에 확인하고 재탐색할 수 있습니다.',
    icon: '📋',
    gradient: 'from-purple-400/20 to-fuchsia-400/20',
  },
];

export const HomeFeatures = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">Features</p>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            핵심 기능
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            AI 기반의 스마트한 식사 추천 시스템으로 더 나은 선택을 경험하세요.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    delay: index * 150,
  });

  return (
    <div
      ref={ref}
      className={`group rounded-3xl border border-white/10 bg-gradient-to-br ${feature.gradient} p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur transition-all duration-700 hover:scale-105 hover:border-white/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="mb-4 text-5xl">{feature.icon}</div>
      <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Feature</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{feature.title}</h3>
      <p className="mt-3 text-base text-slate-300 leading-relaxed">{feature.description}</p>
    </div>
  );
};
