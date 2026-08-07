import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // You could also log the error to an error reporting service like Sentry here
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-200">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-zinc-400 mb-8 max-w-md text-center">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-full font-medium hover:bg-white transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
