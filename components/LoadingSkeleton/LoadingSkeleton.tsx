export default function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Poster skeleton */}
      <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>

      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>

        {/* Date and rating */}
        <div className="flex items-center justify-between mt-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-8"></div>
        </div>
      </div>
    </div>
  );
}
