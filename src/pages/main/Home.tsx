import {
  CtaSection,
  FeatureShowcase,
  HeroSection,
  HomeRecentHistory,
  HowItWorks,
} from '@/components/features/home';
import { useAppSelector } from '@/store/hooks';

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
