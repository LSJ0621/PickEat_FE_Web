/**
 * 홈화면 주요 기능 하이라이트 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';

const highlights = [
  {
    title: 'AI 추천 기능',
    description: '개인화된 메뉴 추천으로 매일 새로운 선택을 경험하세요.',
    icon: '✨',
    color: 'from-orange-400 to-rose-400',
  },
  {
    title: '지도 기반 검색',
    description: '지도와 연동하여 실제 위치 기반 식당을 찾아드립니다.',
    icon: '🗺️',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    title: '개인화된 추천',
    description: '당신의 취향과 이력을 학습하여 더 정확한 추천을 제공합니다.',
    icon: '🎯',
    color: 'from-purple-400 to-fuchsia-400',
  },
];

export const HomeHighlights = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">Highlights</p>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            주요 기능 하이라이트
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            PickEat의 핵심 기능을 통해 더 스마트한 식사 선택을 경험하세요.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <HighlightCard key={highlight.title} highlight={highlight} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface HighlightCardProps {
  highlight: typeof highlights[0];
  index: number;
}

const HighlightCard = ({ highlight, index }: HighlightCardProps) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    delay: index * 150,
  });

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur transition-all duration-700 hover:scale-105 hover:border-white/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
      />
      <div className="relative">
        <div className="mb-4 text-5xl">{highlight.icon}</div>
        <h3 className="text-2xl font-semibold text-white">{highlight.title}</h3>
        <p className="mt-3 text-base text-slate-300 leading-relaxed">{highlight.description}</p>
      </div>
    </div>
  );
};
