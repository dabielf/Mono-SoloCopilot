import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DashboardOverview } from "./components/dashboard/dashboard-overview";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function GWDashboard() {
  // Prefetch dashboard data
  prefetch(trpc.gw.listAll.queryOptions());

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome to Ghostwriter
        </h1>
        <p className="text-muted-foreground mt-2">
          Transform your writing samples into AI that writes exactly like you, for any audience.
        </p>
      </div>

      {/* Dashboard Overview */}
      <HydrateClient>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardOverview />
        </Suspense>
      </HydrateClient>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}