import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { PersonasSkeleton } from "./components/personas-skeleton";
import { PersonasView } from "./components/personas-view";

export default async function PersonasPage() {
  // Prefetch all user data including personas
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Personas</h1>
        <p className="text-muted-foreground">
          Manage target audience profiles for tailored content generation
        </p>
      </div>
      
      <HydrateClient>
        <Suspense fallback={<PersonasSkeleton />}>
          <PersonasView />
        </Suspense>
      </HydrateClient>
    </div>
  );
}