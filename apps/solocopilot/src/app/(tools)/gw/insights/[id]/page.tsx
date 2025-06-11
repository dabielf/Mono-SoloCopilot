import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { InsightDetail } from "../components/insight-detail";
import { InsightDetailSkeleton } from "../components/insight-detail-skeleton";

export default async function InsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required in Next.js 15
  const { id } = await params;
  
  // Prefetch the insight data
  await prefetch(
    trpc.gw.insights.get.queryOptions({ id: Number(id) })
  );
  
  return (
    <HydrateClient>
      <Suspense fallback={<InsightDetailSkeleton />}>
        <InsightDetail id={id} />
      </Suspense>
    </HydrateClient>
  );
}