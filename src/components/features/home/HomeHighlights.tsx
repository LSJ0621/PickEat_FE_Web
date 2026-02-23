/**
 * 홈화면 주요 기능 하이라이트 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useTranslation } from 'react-i18next';

const HIGHLIGHT_CONFIGS = [
  {
    key: 'aiRecommendation',
    icon: '✨',
    color: 'from-orange-400 to-rose-400',
  },
  {
    key: 'mapSearch',
    icon: '🗺️',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    key: 'personalized',
    icon: '🎯',
    color: 'from-purple-400 to-fuchsia-400',
  },
] as const;

export const HomeHighlights = () => {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  const highlights = HIGHLIGHT_CONFIGS.map((config) => ({
    title: t(`home.highlights.${config.key}.title`),
    description: t(`home.highlights.${config.key}.description`),
    icon: config.icon,
    color: config.color,
  }));

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-orange-300">{t('home.highlights.badge')}</p>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            {t('home.highlights.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('home.highlights.description')}
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
  highlight: {
    title: string;
    description: string;
    icon: string;
    color: string;
  };
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
