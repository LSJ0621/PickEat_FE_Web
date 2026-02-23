/**
 * DataErrorFallback component
 * Displays an inline error state with an optional retry button for data-fetching failures.
 *
 * Usage:
 * <DataErrorFallback message="데이터를 불러오지 못했습니다" onRetry={reloadFn} />
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

interface DataErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function DataErrorFallback({
  message = '데이터를 불러오지 못했습니다',
  onRetry,
}: DataErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-bg mb-4">
        <AlertCircle className="h-7 w-7 text-error" aria-hidden="true" />
      </div>

      <p className="text-base font-medium text-text-primary mb-2 text-center">{message}</p>

      <p className="text-sm text-text-tertiary mb-6 text-center max-w-sm">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          다시 시도
        </button>
      )}
    </div>
  );
}
