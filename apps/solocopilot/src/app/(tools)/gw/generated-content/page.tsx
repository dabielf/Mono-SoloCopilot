import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { GeneratedContentView } from "./components/generated-content-view";
import { GeneratedContentSkeleton } from "./components/generated-content-skeleton";

export default async function GeneratedContentPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    writingProfileId?: string;
    psyProfileId?: string;
    personaId?: string;
    ghostwriterId?: string;
  }>;
}) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  
  // Prefetch generated content with any filters provided
  await prefetch(
    trpc.gw.generatedContent.list.queryOptions({ 
      writingProfileId: params.writingProfileId ? Number(params.writingProfileId) : undefined,
      psyProfileId: params.psyProfileId ? Number(params.psyProfileId) : undefined,
      personaId: params.personaId ? Number(params.personaId) : undefined,
      ghostwriterId: params.ghostwriterId ? Number(params.ghostwriterId) : undefined,
      page: 1,
      limit: 20 
    })
  );
  
  return (
    <HydrateClient>
      <Suspense fallback={<GeneratedContentSkeleton />}>
        <GeneratedContentView 
          writingProfileId={params.writingProfileId}
          psyProfileId={params.psyProfileId}
          personaId={params.personaId}
          ghostwriterId={params.ghostwriterId}
        />
      </Suspense>
    </HydrateClient>
  );
}