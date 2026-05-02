export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 border-2 border-slate-200 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

export function TagCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-slate-200 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 rounded flex-1"></div>
        <div className="h-8 bg-slate-200 rounded flex-1"></div>
      </div>
    </div>
  );
}

export function TagListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <TagCardSkeleton key={i} />
      ))}
    </div>
  );
}
