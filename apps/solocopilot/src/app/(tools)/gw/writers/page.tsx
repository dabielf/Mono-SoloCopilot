import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { WritersList } from "../components/writers/writers-list";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function WritersPage() {
  // Prefetch writers data
  prefetch(trpc.gw.listAll.queryOptions());

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ghostwriters</h1>
          <p className="text-muted-foreground">
            Manage your AI writing assistants and their profiles
          </p>
        </div>
      </div>

      {/* Writers List */}
      <HydrateClient>
        <Suspense fallback={<WritersListSkeleton />}>
          <WritersList />
        </Suspense>
      </HydrateClient>
    </div>
  );
}

function WritersListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}