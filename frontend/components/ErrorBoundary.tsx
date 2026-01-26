import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Log to your error tracking service (e.g., Sentry) in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      // Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5 px-4">
          <div className="glass-card p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-destructive to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-destructive mb-2">
                Oops! Something went wrong
              </h2>
              <h3 className="text-xl font-bold text-destructive mb-4">
                અરે! કંઈક ખોટું થયું
              </h3>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left my-4 p-4 bg-background/50 rounded-lg">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground/70 hover:text-foreground">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="mt-2 text-xs text-foreground/60 overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <p className="text-foreground/70 mb-2">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <p className="text-foreground/70 mb-6">
                અનપેક્ષિત ભૂલ આવી. કૃપા કરીને પેજ રિફ્રેશ કરો.
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="bg-gradient-to-r from-accent to-orange-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Refresh Page / પેજ રિફ્રેશ કરો
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="bg-foreground/10 text-foreground px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300"
                >
                  Go Back / પાછા જાઓ
                </button>
              </div>

              {/* Contact Support */}
              <p className="text-xs text-foreground/50 mt-6">
                If the problem persists, please contact support.
                <br />
                જો સમસ્યા ચાલુ રહે, તો કૃપા કરીને સપોર્ટનો સંપર્ક કરો.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
