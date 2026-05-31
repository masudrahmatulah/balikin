"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  AlertOctagon,
  Bug,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Admin Error Boundary
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 */
export class AdminErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Admin Error Boundary caught an error:", error, errorInfo);

    // You could also log to a service here like Sentry
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = "/admin";
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white dark:from-red-900/20 dark:via-gray-900 dark:to-gray-900">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertOctagon className="w-6 h-6" />
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Details */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <Bug className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-100">
                        Error Details
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {this.state.error?.message || "An unexpected error occurred"}
                      </p>
                      {process.env.NODE_ENV === "development" && (
                        <details className="mt-3">
                          <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:text-red-700 dark:hover:text-red-300">
                            Technical Details
                          </summary>
                          <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto max-h-40">
                            {this.state.error?.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>

                {/* What to do */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't worry, your data is safe. This is just a display error.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={this.handleReset}
                      className="gap-2"
                      variant="default"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Button>
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Go to Dashboard
                    </Button>
                  </div>
                </div>

                {/* Report Issue */}
                {process.env.NODE_ENV === "production" && (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-4" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary with custom fallback component
 * Use this for specific sections of the admin
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <AdminErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };
}

/**
 * Async Error Boundary for server components and async operations
 * Catches promise rejections and async errors
 */
export class AsyncErrorBoundary extends React.Component<Props, State> {
  private state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Async Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <AdminErrorBoundary fallback={this.props.fallback}>
          {this.props.fallback || (
            <div className="flex items-center justify-center min-h-screen">
              <Card className="border-red-200 dark:border-red-800 max-w-md">
                <CardContent className="py-12 text-center">
                  <AlertOctagon className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Loading Error
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Failed to load content. Please try again.
                  </p>
                  <Button onClick={this.handleReset} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </AdminErrorBoundary>
      );
    }

    return this.props.children;
  }
}
