import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  t: (key: string) => string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Removed explicit `public` access modifiers from class members.
  // While `public` is the default access level, its explicit use was
  // interfering with TypeScript's type inference for React component props
  // in this specific environment, causing `this.props` to be unrecognized.
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="bg-background text-foreground min-h-screen p-8 font-sans">
          <h1 className="text-3xl font-bold text-destructive border-b pb-4 mb-4">{this.props.t('error.boundaryTitle')}</h1>
          <p className="text-lg text-muted-foreground">{this.props.t('error.boundaryMessage')}</p>
          <details className="mt-6 bg-secondary p-4 rounded-lg">
            <summary className="cursor-pointer font-semibold">{this.props.t('error.boundaryDetails')}</summary>
            <pre className="whitespace-pre-wrap break-all mt-2 text-sm text-muted-foreground">
              {this.state.error?.toString()}
              <br />
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
