import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { InsightsView } from "./components/insights-view";
import { InsightsSkeleton } from "./components/insights-skeleton";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ resourceId?: string }>;
}) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  
  // Prefetch insights for the specific resource if provided
  if (params.resourceId) {
    await prefetch(
      trpc.gw.insights.list.queryOptions({ 
        resourceId: Number(params.resourceId),
        page: 1,
        limit: 20 
      })
    );
  }
  
  return (
    <HydrateClient>
      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsView resourceId={params.resourceId} />
      </Suspense>
    </HydrateClient>
  );
}