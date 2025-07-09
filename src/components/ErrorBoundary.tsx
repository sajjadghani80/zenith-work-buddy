import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: 'hsl(var(--app-background))' }}
        >
          <div className="text-center max-w-md">
            <AlertTriangle 
              className="w-16 h-16 mx-auto mb-4" 
              style={{ color: 'hsl(var(--destructive))' }}
            />
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: 'hsl(var(--app-text-primary))' }}
            >
              Something went wrong
            </h1>
            <p 
              className="text-base mb-6"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <Button 
              onClick={this.handleReload}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;