/**
 * 로그인 페이지 브랜드 패널 (데스크톱 좌측)
 * - lg 이상에서만 표시
 */

import { UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoginBrandPanel() {
  const { t } = useTranslation();

  return (
    <div className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-amber px-12 py-16 text-white">
      {/* Background decorative circles */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute bottom-1/4 -right-8 h-32 w-32 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <UtensilsCrossed className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">PickEat</span>
        </div>

        {/* App description */}
        <p className="mb-10 text-lg leading-relaxed text-white/90">
          {t('auth.appDescription')}
        </p>

        {/* Benefits section */}
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
            {t('auth.benefitsTitle')}
          </p>
          <p className="mb-4 text-base font-semibold text-white">
            {t('auth.benefitsSubtitle')}
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              <span className="text-sm leading-relaxed text-white/90">{t('auth.benefit1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
              <span className="text-sm leading-relaxed text-white/90">{t('auth.benefit2')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
