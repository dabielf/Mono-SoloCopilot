import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { GWNavigation } from "./components/layout/gw-navigation";
import { GWHeader } from "./components/layout/gw-header";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

interface Props {
  children: React.ReactNode;
}

export default async function GWLayout({ children }: Props) {
  // Prefetch all the data we'll need across the app
  prefetch(trpc.gw.listAll.queryOptions());

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <HydrateClient>
        <Suspense fallback={<NavigationSkeleton />}>
          <GWNavigation />
        </Suspense>
      </HydrateClient>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <HydrateClient>
          <Suspense fallback={<HeaderSkeleton />}>
            <GWHeader />
          </Suspense>
        </HydrateClient>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <HydrateClient>
            {children}
          </HydrateClient>
        </main>
      </div>
    </div>
  );
}

function NavigationSkeleton() {
  return (
    <div className="w-64 border-r bg-muted/10 p-4 space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-4/5" />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="border-b p-4 flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}