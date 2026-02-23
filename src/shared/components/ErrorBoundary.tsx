import React from 'react';

/**
 * ErrorBoundary component props
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * ErrorBoundary component state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component
 * Catches React errors in child components and displays a fallback UI
 *
 * @usage
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * @features
 * - Catches runtime errors in React component tree
 * - Logs error details to console
 * - Displays user-friendly error UI
 * - Provides retry mechanism (page reload)
 * - Provides navigation to home page
 * - Fully accessible with ARIA labels
 * - Responsive design (mobile-first)
 * - Follows project styling patterns
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state when an error is caught
   * This lifecycle method is called during the "render" phase
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log error information to console
   * This lifecycle method is called during the "commit" phase
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  /**
   * Reset error state and reload the page
   */
  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  /**
   * Render error fallback UI
   * Displays error information with retry and navigation options
   */
  renderErrorFallback() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
            <svg
              className="h-12 w-12 text-brand-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            Something went wrong
          </h1>

          {/* Error Description */}
          <p className="mb-8 text-text-tertiary">
            An unexpected error occurred. Please try again.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {/* Refresh Button */}
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-brand-primary px-6 py-3 font-medium text-text-inverse transition-colors hover:bg-[#e55f2f] focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Refresh page"
            >
              Refresh
            </button>

            {/* Go to Home Button */}
            <button
              onClick={() => window.location.href = '/'}
              className="rounded-lg border border-border-default bg-bg-surface px-6 py-3 font-medium text-text-secondary transition-colors hover:border-border-focus hover:bg-bg-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Go to home page"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}
