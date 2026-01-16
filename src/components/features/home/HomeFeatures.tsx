/**
 * 홈화면 기능 소개 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useTranslation } from 'react-i18next';

const FEATURE_CONFIGS = [
  {
    key: 'aiRecommendation',
    icon: '🤖',
    gradient: 'from-orange-400/20 to-rose-400/20',
  },
  {
    key: 'storeSearch',
    icon: '🗺️',
    gradient: 'from-blue-400/20 to-cyan-400/20',
  },
  {
    key: 'history',
    icon: '📋',
    gradient: 'from-purple-400/20 to-fuchsia-400/20',
  },
] as const;

export const HomeFeatures = () => {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  const features = FEATURE_CONFIGS.map((config) => ({
    title: t(`home.features.${config.key}.title`),
    description: t(`home.features.${config.key}.description`),
    icon: config.icon,
    gradient: config.gradient,
  }));

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">{t('home.features.badge')}</p>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            {t('home.features.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('home.features.description')}
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
  feature: {
    title: string;
    description: string;
    icon: string;
    gradient: string;
  };
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const { t } = useTranslation();
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
      <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">{t('home.features.cardBadge')}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{feature.title}</h3>
      <p className="mt-3 text-base text-slate-300 leading-relaxed">{feature.description}</p>
    </div>
  );
};
