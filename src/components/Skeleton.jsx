export default function Skeleton({ className = '', count = 1 }) {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`glass rounded-2xl ${className}`}>
            <div className="animate-pulse">
              <div className="h-40 bg-surface2 rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-surface2 rounded w-1/3" />
                <div className="h-4 bg-surface2 rounded w-2/3" />
                <div className="h-3 bg-surface2 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </>
    )
  }
  return (
    <div className={`glass rounded-2xl animate-pulse ${className}`}>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-surface2 rounded w-1/3" />
        <div className="h-4 bg-surface2 rounded w-2/3" />
        <div className="h-3 bg-surface2 rounded w-1/2" />
      </div>
    </div>
  )
}
