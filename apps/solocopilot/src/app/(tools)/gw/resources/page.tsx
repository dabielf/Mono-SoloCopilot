import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ResourcesView } from "./components/resources-view";
import { ResourcesSkeleton } from "./components/resources-skeleton";

export default async function ResourcesPage() {
  await prefetch(trpc.gw.resources.list.queryOptions({ page: 1, limit: 20 }));
  
  return (
    <HydrateClient>
      <Suspense fallback={<ResourcesSkeleton />}>
        <ResourcesView />
      </Suspense>
    </HydrateClient>
  );
}