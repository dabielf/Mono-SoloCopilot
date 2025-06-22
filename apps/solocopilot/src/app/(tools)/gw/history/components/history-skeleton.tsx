import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HistorySkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters skeleton */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-44" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-44" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-44" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History list skeleton */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}