/**
 * Loading skeleton components for blog pages
 */

import { Card, CardContent } from '@/components/ui/card';

export function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full bg-muted animate-pulse" />
      <CardContent className="p-6">
        <div className="h-6 bg-muted animate-pulse rounded mb-2 w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded mb-4 w-full" />
        <div className="h-4 bg-muted animate-pulse rounded mb-1 w-1/2" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
      </CardContent>
    </Card>
  );
}

export function BlogPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-muted h-48 md:h-64" />

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Cover Image Skeleton */}
          <div className="aspect-video w-full bg-muted rounded-xl animate-pulse" />

          {/* Title Skeleton */}
          <div className="h-8 bg-muted animate-pulse rounded w-3/4 mb-4" />

          {/* Meta Skeleton */}
          <div className="flex gap-4">
            <div className="h-4 bg-muted animate-pulse rounded w-20" />
            <div className="h-4 bg-muted animate-pulse rounded w-24" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 bg-muted animate-pulse rounded ${
                  i === 3 || i === 7 ? 'w-2/3' : 'w-full'
                }`}
              />
            ))}
          </div>

          {/* Module Skeleton */}
          <div className="bg-muted/40 p-6 rounded-xl animate-pulse h-64" />

          {/* Comments Skeleton */}
          <div className="space-y-4 pt-8 border-t">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted p-4 rounded-lg animate-pulse h-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="bg-muted p-4 rounded-lg animate-pulse">
      <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-2" />
      <div className="h-3 bg-muted-foreground/20 rounded w-full mb-1" />
      <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
    </div>
  );
}

export function BlogListingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-muted h-40 md:h-48" />

      {/* Blog Posts Grid Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
