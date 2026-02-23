import { cn } from '@/utils/cn';
import { scaleIn, slideInLeft } from '@/utils/motion';
import { motion, type Variants } from 'framer-motion';
import { Heart, MapPin, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  iconBg: string;
  visualBg: string;
  sectionBg: string;
}

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    titleKey: 'home.features.aiRecommendation.title',
    descriptionKey: 'home.features.aiRecommendation.description',
    iconBg: 'from-brand-primary/20 to-brand-amber/10',
    visualBg: 'from-brand-primary to-brand-amber',
    sectionBg: 'bg-bg-secondary',
  },
  {
    icon: Heart,
    titleKey: 'home.features.weather.title',
    descriptionKey: 'home.features.weather.description',
    iconBg: 'from-sky-400/20 to-blue-500/10',
    visualBg: 'from-sky-400 to-blue-500',
    sectionBg: 'bg-white',
  },
  {
    icon: MapPin,
    titleKey: 'home.features.placeDiscovery.title',
    descriptionKey: 'home.features.placeDiscovery.description',
    iconBg: 'from-brand-secondary/20 to-brand-coral/10',
    visualBg: 'from-brand-secondary to-brand-coral',
    sectionBg: 'bg-bg-secondary',
  },
  {
    icon: Users,
    titleKey: 'home.features.community.title',
    descriptionKey: 'home.features.community.description',
    iconBg: 'from-brand-amber/20 to-orange-500/10',
    visualBg: 'from-brand-amber to-orange-500',
    sectionBg: 'bg-white',
  },
];

interface FeaturePanelProps {
  feature: Feature;
  index: number;
}

function FeaturePanel({ feature, index }: FeaturePanelProps) {
  const { t } = useTranslation();
  const isEven = index % 2 === 0;
  const Icon = feature.icon;
  const textVariant = isEven ? slideInLeft : slideInRight;

  const textContent = (
    <motion.div
      variants={textVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="flex flex-col gap-3 sm:gap-4"
    >
      <div
        className={cn(
          'w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
          feature.iconBg
        )}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
          {t(feature.titleKey)}
        </h3>
        <p className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-md mt-4">
          {t(feature.descriptionKey)}
        </p>
      </div>
    </motion.div>
  );

  const visualContent = (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'rounded-3xl aspect-[3/2] md:aspect-[16/10] bg-gradient-to-br flex items-center justify-center relative overflow-hidden',
        feature.visualBg,
        !isEven && 'md:order-first'
      )}
    >
      <Icon
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-white opacity-20 animate-gentle-orbit absolute"
        aria-hidden="true"
      />
      <Icon className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white relative z-10" aria-hidden="true" />
    </motion.div>
  );

  return (
    <div className={cn('py-12 sm:py-16 md:py-20', feature.sectionBg)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-14 items-center">
          {textContent}
          {visualContent}
        </div>
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">{t('home.features.title')}</h2>
      {FEATURES.map((feature, index) => (
        <FeaturePanel key={feature.titleKey} feature={feature} index={index} />
      ))}
    </section>
  );
}
