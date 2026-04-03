interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`shimmer rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function ScoreSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-[120px] w-[120px] rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
