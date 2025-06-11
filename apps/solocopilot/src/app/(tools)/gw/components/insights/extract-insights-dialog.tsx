"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ExtractInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  resourceTitle?: string;
  onSuccess?: () => void;
}

export function ExtractInsightsDialog({
  open,
  onOpenChange,
  resourceId,
  resourceTitle,
  onSuccess,
}: ExtractInsightsDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [extractionTopic, setExtractionTopic] = useState("");

  // Query personas for extraction
  const { data: allData } = useQuery(trpc.gw.listAll.queryOptions());
  const personas = allData?.[0]?.personas || [];

  // Extract insights mutation
  const extractInsightsOptions = trpc.gw.insights.extract.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.insights.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.get.queryKey() });
      toast.success("Insights extracted successfully!");
      
      // Reset form
      setSelectedPersona("");
      setExtractionTopic("");
      
      // Close dialog
      onOpenChange(false);
      
      // Call custom success handler if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: navigate to insights page
        router.push(`/gw/insights?resourceId=${resourceId}`);
      }
    },
    onError: (error) => {
      toast.error("Failed to extract insights: " + error.message);
    }
  });
  const extractInsights = useMutation(extractInsightsOptions);

  const handleExtract = async () => {
    if (!selectedPersona) {
      toast.error("Please select a persona");
      return;
    }

    await extractInsights.mutateAsync({
      resourceId: resourceId,
      personaId: selectedPersona,
      topic: extractionTopic.trim() || undefined,
    });
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing while extraction is in progress
    if (!extractInsights.isPending) {
      onOpenChange(open);
      // Reset form when closing
      if (!open) {
        setSelectedPersona("");
        setExtractionTopic("");
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Extract New Insights</AlertDialogTitle>
          <AlertDialogDescription>
            Extract insights from {resourceTitle ? `"${resourceTitle}"` : "this resource"} for a specific persona
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {extractInsights.isPending ? (
          <div className="py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Brain className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Extracting Insights...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing content for {personas.find(p => p.id.toString() === selectedPersona)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="persona">Target Persona</Label>
                <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                  <SelectTrigger id="persona">
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id.toString()}>
                        {persona.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic">
                  Focus Topic (Optional)
                  <span className="text-xs text-muted-foreground ml-2">
                    Leave empty to extract general insights
                  </span>
                </Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., Extract insights about productivity tips..."
                  value={extractionTopic}
                  onChange={(e) => setExtractionTopic(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={handleExtract}
                disabled={!selectedPersona}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Extract Insights
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}