import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ResourceDetail } from "../components/resource-detail";
import { ResourceDetailSkeleton } from "../components/resource-detail-skeleton";

export default async function ResourceDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  await prefetch(trpc.gw.resources.get.queryOptions({ id: Number(params.id) }));
  
  return (
    <HydrateClient>
      <Suspense fallback={<ResourceDetailSkeleton />}>
        <ResourceDetail id={params.id} />
      </Suspense>
    </HydrateClient>
  );
}