import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorHandling';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle uncaught errors in the component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logError(error, { componentStack: errorInfo.componentStack });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      // Use the provided fallback or generate a default one
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      // Default error UI
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
