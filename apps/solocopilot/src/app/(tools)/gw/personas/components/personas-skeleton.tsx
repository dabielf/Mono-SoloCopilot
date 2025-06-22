import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PersonasSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header actions skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" /> {/* Search bar */}
        <Skeleton className="h-10 w-32" /> {/* Create button */}
      </div>

      {/* Personas grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" /> {/* Name */}
                  <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
                  <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-24" /> {/* Insights count */}
                <Skeleton className="h-5 w-20" /> {/* Created date */}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" /> {/* View button */}
                <Skeleton className="h-8 w-16" /> {/* Edit button */}
                <Skeleton className="h-8 w-16" /> {/* More button */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}