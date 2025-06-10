import { Suspense } from "react";
import { GhostwriterCreationWizard } from "../../components/writers/ghostwriter-creation-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default function NewGhostwriterPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Create Your AI Ghostwriter
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your writing samples and let AI learn your unique voice, style, and personality. 
            Your ghostwriter will be able to create content that sounds authentically like you.
          </p>
        </div>

        {/* Creation Wizard */}
        <Suspense fallback={<CreationSkeleton />}>
          <GhostwriterCreationWizard />
        </Suspense>
      </div>
    </div>
  );
}

function CreationSkeleton() {
  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}