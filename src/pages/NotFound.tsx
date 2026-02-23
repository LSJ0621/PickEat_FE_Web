/**
 * 404 Not Found Page
 * 존재하지 않는 경로 접근 시 표시되는 페이지
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4 text-text-primary">
      <div className="max-w-md text-center">
        {/* 404 Text */}
        <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>

        {/* Message */}
        <h2 className="mb-2 text-2xl font-semibold">
          {t('errors.notFound.title') || 'Page Not Found'}
        </h2>
        <p className="mb-8 text-text-secondary">
          {t('errors.notFound.message') || 'The page you are looking for does not exist or has been moved.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90"
          >
            <Home className="h-5 w-5" />
            {t('common.goHome') || 'Go Home'}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-bg-secondary px-6 py-3 font-medium transition hover:bg-bg-hover"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('common.goBack') || 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};
