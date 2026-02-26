/**
 * 홈화면 기능 소개 섹션 컴포넌트
 */

import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { Bot, BarChart3, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FEATURE_CONFIGS = [
  {
    key: 'aiRecommendation',
    icon: Bot,
    accentColor: 'brand-primary' as const,
  },
  {
    key: 'storeSearch',
    icon: MapPin,
    accentColor: 'brand-amber' as const,
  },
  {
    key: 'weeklyAnalysis',
    icon: BarChart3,
    accentColor: 'brand-coral' as const,
  },
];

type AccentColor = (typeof FEATURE_CONFIGS)[number]['accentColor'];

export const HomeFeatures = () => {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '50px 0px',
    fallbackTimeout: 2500
  });

  const features = FEATURE_CONFIGS.map((config) => ({
    title: t(`home.features.${config.key}.title`),
    description: t(`home.features.${config.key}.description`),
    icon: config.icon,
    accentColor: config.accentColor,
  }));

  return (
    <section id="features-section" ref={ref} className="py-20 px-4 bg-bg-surface">
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary font-medium">
            <span className="bg-brand-tertiary text-brand-primary rounded-full px-3 py-1 text-xs font-medium inline-block">
              {t('home.features.badge')}
            </span>
          </p>
          <h2 className="mt-4 text-4xl font-bold text-text-primary sm:text-5xl">
            {t('home.features.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            {t('home.features.description')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ACCENT_BAR_CLASSES: Record<AccentColor, string> = {
  'brand-primary': 'bg-brand-primary',
  'brand-amber': 'bg-brand-amber',
  'brand-coral': 'bg-brand-coral',
};

const ACCENT_BG_CLASSES: Record<AccentColor, string> = {
  'brand-primary': 'bg-brand-primary/10',
  'brand-amber': 'bg-brand-amber/10',
  'brand-coral': 'bg-brand-coral/10',
};

const ACCENT_ICON_CLASSES: Record<AccentColor, string> = {
  'brand-primary': 'text-brand-primary',
  'brand-amber': 'text-brand-amber',
  'brand-coral': 'text-brand-coral',
};

const ACCENT_RING_CLASSES: Record<AccentColor, string> = {
  'brand-primary': 'group-hover:ring-brand-primary/20',
  'brand-amber': 'group-hover:ring-brand-amber/20',
  'brand-coral': 'group-hover:ring-brand-coral/20',
};

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: LucideIcon;
    accentColor: AccentColor;
  };
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const IconComponent = feature.icon;

  return (
    <div
      className={`stagger-item group relative overflow-hidden rounded-[var(--radius-lg)] border border-border-light bg-bg-surface p-6 sm:p-8 shadow-[var(--shadow-card)] card-interactive ${ACCENT_RING_CLASSES[feature.accentColor]} hover:ring-2`}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-[var(--radius-lg)] ${ACCENT_BAR_CLASSES[feature.accentColor]} transition-all duration-300 group-hover:h-1.5`} />
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${ACCENT_BG_CLASSES[feature.accentColor]} transition-transform duration-300 group-hover:scale-110`}>
        <IconComponent className={`h-8 w-8 ${ACCENT_ICON_CLASSES[feature.accentColor]}`} />
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-text-primary">{feature.title}</h3>
      <p className="mt-3 text-base text-text-secondary leading-relaxed">{feature.description}</p>
    </div>
  );
};
