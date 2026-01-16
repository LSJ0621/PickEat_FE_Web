import { useTranslation } from 'react-i18next';

export function PageLoadingFallback() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div
          data-testid="loading-spinner"
          className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        />
        <p className="mt-4 text-gray-400">{t('common.pageLoading')}</p>
      </div>
    </div>
  );
}
