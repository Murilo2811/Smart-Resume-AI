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
  // Fix: The original error "Property 'props' does not exist on type 'ErrorBoundary'"
  // can be caused by subtle TypeScript configuration issues with class property
  // initializers. Switching to a constructor for state initialization is a more
  // robust pattern that avoids these potential pitfalls.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
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
