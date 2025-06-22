"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  FileSearch, 
  Lightbulb, 
  Sparkles,
  ChevronRight,
  Loader2,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { Persona, ResourceContent } from "@repo/zod-types";

// Utility function to safely format dates
function safeFormatDistanceToNow(dateString: string): string {
  try {
    // Handle different date formats
    let date: Date;
    
    // If it's already a valid date string
    if (typeof dateString === 'string') {
      // Try parsing as ISO string first
      date = new Date(dateString);
      
      // If that fails, try parsing as timestamp
      if (isNaN(date.getTime()) && !isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      }
    } else {
      // If it's a number (timestamp)
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.log("Invalid date:", dateString);
      return "Invalid date";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.log("Date formatting error:", error, dateString);
    return "Invalid date";
  }
}

interface ViewPersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
  resources: ResourceContent[];
}

export function ViewPersonaDialog({ 
  open, 
  onOpenChange, 
  persona,
  resources
}: ViewPersonaDialogProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [extractingFrom, setExtractingFrom] = useState<number | null>(null);
  
  // Fetch full persona details when dialog opens
  const { data: fullPersona, isLoading: personaLoading } = useQuery({
    ...trpc.gw.persona.get.queryOptions({ id: persona.id }),
    enabled: open, // Only fetch when dialog is open
  });
  
  // Use full persona data if available, fallback to basic persona data
  const personaData = fullPersona || persona;
  
  // Format created date safely
  const createdDate = safeFormatDistanceToNow(personaData.createdAt);
  
  // Extract insights mutation
  const extractInsightsOptions = trpc.gw.insights.extract.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.insights.list.queryKey() });
      toast.success("Insights extracted successfully!");
      setExtractingFrom(null);
    },
    onError: (error) => {
      toast.error(`Failed to extract insights: ${error.message}`);
      setExtractingFrom(null);
    }
  });
  const extractInsights = useMutation(extractInsightsOptions);
  
  const handleExtractInsights = async (resourceId: number) => {
    setExtractingFrom(resourceId);
    await extractInsights.mutateAsync({
      personaId: persona.id.toString(),
      resourceId: resourceId.toString(),
    });
  };
  
  // Quick actions
  const navigateToInsights = () => {
    router.push(`/gw/insights?personaId=${persona.id}`);
    onOpenChange(false);
  };
  
  const navigateToGenerate = () => {
    router.push(`/gw/generate?personaId=${persona.id}`);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{personaData.name}</DialogTitle>
          <DialogDescription>
            {personaData.description || "Target audience persona"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created {createdDate}</span>
            </div>
          </div>
          
          {/* Persona Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Persona Definition
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg max-h-[300px] overflow-y-auto">
              {personaLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading persona details...
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {personaData.content ? (
                    <ReactMarkdown>{personaData.content}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">No content available</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Quick Actions</h3>
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={navigateToInsights}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                View Extracted Insights
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={navigateToGenerate}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content for this Persona
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </div>
          
          {/* Extract Insights from Resources */}
          {resources.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Extract Insights from Resources</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {resources.map((resource) => (
                    <div 
                      key={resource.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {safeFormatDistanceToNow(resource.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleExtractInsights(resource.id)}
                        disabled={extractingFrom === resource.id || extractInsights.isPending}
                      >
                        {extractingFrom === resource.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <FileSearch className="h-3 w-3 mr-1" />
                            Extract
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}