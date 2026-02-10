interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-4 w-full ${className}`} />;
}

export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return <Skeleton className={`size-10 rounded-full ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <SkeletonCircle className="size-12" />
        <div className="flex-1 space-y-3">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function PromptAnalyzerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Score section */}
      <div className="flex items-center justify-center py-8">
        <Skeleton className="size-24 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <SkeletonText className="mb-2 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>

      {/* Issues section */}
      <div className="space-y-3">
        <SkeletonText className="w-1/4" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>

      {/* Suggestions section */}
      <div className="space-y-3">
        <SkeletonText className="w-1/4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <SkeletonText className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
