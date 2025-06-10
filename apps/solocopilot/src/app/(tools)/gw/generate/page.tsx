import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { GenerationWorkspace } from "../components/generation/generation-workspace";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  // Prefetch data needed for generation
  prefetch(trpc.gw.listAll.queryOptions());

  return (
    <div className="flex h-full">
      <HydrateClient>
        <Suspense fallback={<GenerationSkeleton />}>
          <GenerationWorkspace />
        </Suspense>
      </HydrateClient>
    </div>
  );
}

function GenerationSkeleton() {
  return (
    <div className="flex w-full h-full">
      {/* Configuration Panel Skeleton */}
      <div className="w-96 border-r p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <Skeleton className="h-12 w-full" />
      </div>
      
      {/* Content Area Skeleton */}
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}