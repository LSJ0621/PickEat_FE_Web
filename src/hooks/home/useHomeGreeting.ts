import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { TIME_SLOTS } from '@/utils/constants';

interface GreetingData {
  message: string;
  emoji: string;
  subtext: string;
}

interface UseHomeGreetingReturn {
  greeting: GreetingData;
  isAuthenticated: boolean;
  ctaLabel: string;
  socialHint: string;
  handleCtaClick: () => void;
}

function getTimeSlot(hour: number): 'morning' | 'lunch' | 'evening' | 'night' {
  if (hour >= TIME_SLOTS.MORNING.start && hour < TIME_SLOTS.MORNING.end) return 'morning';
  if (hour >= TIME_SLOTS.LUNCH.start && hour < TIME_SLOTS.LUNCH.end) return 'lunch';
  if (hour >= TIME_SLOTS.EVENING.start && hour < TIME_SLOTS.EVENING.end) return 'evening';
  return 'night';
}

const EMOJI_MAP = {
  morning: '🌅',
  lunch: '☀️',
  evening: '🌆',
  night: '🌙',
} as const;

export function useHomeGreeting(): UseHomeGreetingReturn {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const greeting = useMemo<GreetingData>(() => {
    const slot = getTimeSlot(new Date().getHours());
    return {
      message: t(`home.greeting.${slot}`),
      emoji: EMOJI_MAP[slot],
      subtext: isAuthenticated
        ? t('home.greeting.subtext')
        : t('home.greeting.subtextGuest'),
    };
  }, [t, isAuthenticated]);

  const { ctaLabel, socialHint } = useMemo(() => ({
    ctaLabel: isAuthenticated
      ? t('home.greeting.ctaAuthenticated')
      : t('home.greeting.ctaGuest'),
    socialHint: t('home.greeting.socialHint'),
  }), [t, isAuthenticated]);

  const handleCtaClick = useCallback(() => {
    navigate(isAuthenticated ? '/agent' : '/login');
  }, [isAuthenticated, navigate]);

  return { greeting, isAuthenticated, ctaLabel, socialHint, handleCtaClick };
}
