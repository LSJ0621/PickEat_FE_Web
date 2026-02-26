import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  fallbackMessage?: string;
  onRetry?: () => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRY_COUNT = 3;

/**
 * Feature-level Error Boundary
 * Catches errors in specific feature sections and provides retry functionality
 *
 * Usage:
 * <FeatureErrorBoundary featureName="Agent" fallbackMessage="AI Agent failed to load">
 *   <AgentComponent />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log with feature name for easier debugging
    if (import.meta.env.DEV) {
      console.error(`[${this.props.featureName}] Feature Error:`, error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    const { retryCount } = this.state;
    const { onRetry } = this.props;

    if (retryCount < MAX_RETRY_COUNT) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: retryCount + 1,
      });

      // Call custom retry handler if provided
      if (onRetry) {
        onRetry();
      }
    }
  };

  render() {
    const { hasError, retryCount } = this.state;
    const { children, featureName, fallbackMessage } = this.props;

    if (hasError) {
      const canRetry = retryCount < MAX_RETRY_COUNT;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg mb-4">
            <AlertTriangle className="h-8 w-8 text-error" aria-hidden="true" />
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {fallbackMessage || `${featureName} encountered an error`}
          </h3>

          <p className="text-sm text-text-tertiary mb-6 text-center max-w-md">
            {canRetry
              ? 'Something went wrong. Please try again.'
              : 'This feature is temporarily unavailable. Please contact support if the issue persists.'}
          </p>

          {canRetry && (
            <Button
              onClick={this.handleRetry}
              variant="primary"
              size="md"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          )}

          {!canRetry && (
            <p className="text-xs text-text-tertiary mt-4">
              Retry limit reached ({MAX_RETRY_COUNT} attempts)
            </p>
          )}
        </div>
      );
    }

    return children;
  }
}
