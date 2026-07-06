export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="shimmer aspect-square rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-3 w-1/3 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="shimmer h-6 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded ${className}`} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 glass-card">
      <div className="shimmer w-16 h-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
      </div>
      <div className="shimmer h-8 w-20 rounded-xl" />
    </div>
  );
}
