import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ProfilesView } from "./components/profiles-view";
import { ProfilesSkeleton } from "./components/profiles-skeleton";

export default async function ProfilesPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<ProfilesSkeleton />}>
        <ProfilesView />
      </Suspense>
    </HydrateClient>
  );
}