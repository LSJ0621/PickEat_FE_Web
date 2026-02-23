import { useTranslation } from 'react-i18next';

export function PageLoadingFallback() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div
          data-testid="loading-spinner"
          className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"
        />
        <p className="mt-4 text-text-tertiary">{t('common.pageLoading')}</p>
      </div>
    </div>
  );
}
