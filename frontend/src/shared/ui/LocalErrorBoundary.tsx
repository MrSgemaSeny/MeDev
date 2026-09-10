import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class LocalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Local error caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-default)] text-center h-full w-full">
          <AlertTriangle size={32} className="text-danger mb-4 opacity-80" />
          <h2 className="text-lg font-semibold text-primary mb-2">Component Error</h2>
          <p className="text-sm text-secondary mb-4 max-w-sm">
            Something went wrong while rendering this component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-default)] text-primary rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
