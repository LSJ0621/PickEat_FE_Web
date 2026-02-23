import {
  CtaSection,
  FeatureShowcase,
  HeroSection,
  HomeRecentHistory,
  HowItWorks,
} from '@features/home/components';
import { useAppSelector } from '@app/store/hooks';

export function HomePage() {
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  return (
    <div className="min-h-screen">
      <HeroSection />
      {isAuthenticated && <HomeRecentHistory />}
      <FeatureShowcase />
      <HowItWorks />
      <CtaSection />
    </div>
  );
}
