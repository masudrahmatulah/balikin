'use client';

/**
 * Error boundary for blog pages
 * Catches errors and displays user-friendly error messages
 */

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class BlogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Blog Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <CardTitle>Terjadi Kesalahan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Maaf, terjadi kesalahan saat memuat halaman blog. Silakan coba lagi.
              </p>

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
                <Button
                  onClick={() => (window.location.href = '/blog')}
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ke Blog
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Detail Error (Development)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {this.state.error.toString()}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback component for blog listing page
 */
export function BlogListingErrorFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Blog BALIKIN</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Blog Tidak Tersedia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Terjadi kesalahan saat memuat daftar artikel. Silakan coba lagi nanti.
            </p>
            <Button onClick={() => window.location.reload()} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Fallback component for individual blog post page
 */
export function BlogPostErrorFallback({ slug }: { slug?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Blog BALIKIN</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Artikel Tidak Ditemukan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {slug
                ? 'Terjadi kesalahan saat memuat artikel ini. Artikel mungkin telah dihapus atau terjadi kesalahan teknis.'
                : 'Artikel yang Anda cari tidak ditemukan.'}
            </p>

            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
              <Button
                onClick={() => (window.location.href = '/blog')}
                variant="outline"
              >
                Lihat Daftar Artikel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
