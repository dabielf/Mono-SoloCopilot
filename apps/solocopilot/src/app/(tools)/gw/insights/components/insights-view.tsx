"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Lightbulb, 
  Plus, 
  Trash2, 
  FileText,
  User,
  Target,
  Calendar,
  ChevronLeft,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ExtractInsightsDialog } from "@/app/(tools)/gw/components/insights/extract-insights-dialog";
import type { InsightWithRelations, Persona, ResourceContent } from "@repo/zod-types";

interface InsightsViewProps {
  resourceId?: string;
}

export function InsightsView({ resourceId }: InsightsViewProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [deleteInsightId, setDeleteInsightId] = useState<number | null>(null);
  const [insightToDelete, setInsightToDelete] = useState<InsightWithRelations | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<string>("all");

  // Query resource details if resourceId is provided
  const { data: resource } = useQuery({
    ...trpc.gw.resources.get.queryOptions({ id: Number(resourceId) }),
    enabled: !!resourceId
  });

  // Query all data for filter dropdowns
  const { data: allData } = useQuery(trpc.gw.listAll.queryOptions());
  
  // Query insights with filters
  const { data: insightsData, isLoading } = useQuery(
    trpc.gw.insights.list.queryOptions({ 
      resourceId: resourceId ? Number(resourceId) : selectedResource !== "all" ? Number(selectedResource) : undefined,
      personaId: selectedPersona !== "all" ? selectedPersona : undefined,
      page: currentPage, 
      limit: 20 
    })
  );


  // Delete mutation
  const deleteInsightOptions = trpc.gw.insights.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.insights.list.queryKey() });
      toast.success("Insight deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete insight: " + error.message);
    }
  });
  const deleteInsight = useMutation(deleteInsightOptions);

  const insights = insightsData?.data || [];
  const hasMore = insightsData?.meta?.hasMore || false;

  const handleDeleteClick = (insight: InsightWithRelations) => {
    setInsightToDelete(insight);
    setDeleteInsightId(insight.id);
  };

  const handleDeleteConfirm = () => {
    if (deleteInsightId) {
      deleteInsight.mutate({ id: deleteInsightId });
      setDeleteInsightId(null);
      setInsightToDelete(null);
    }
  };

  const handleViewInsight = (insightId: number) => {
    router.push(`/gw/insights/${insightId}`);
  };

  const toggleExpanded = (insightId: number) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  const isExpanded = (insightId: number) => expandedInsights.has(insightId);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          {resourceId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/gw/resources/${resourceId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Resource
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {resourceId && resource ? `Insights from "${resource.title}"` : "All Insights"}
          </h1>
          <Badge variant="secondary" className="text-sm font-light">
            {insightsData?.meta?.total || 0} insights
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {resourceId 
            ? "Manage and extract insights from this resource"
            : "Browse all extracted insights across your resources"
          }
        </p>
      </div>

      {/* Actions */}
      {resourceId && (
        <div className="flex gap-4">
          <Button onClick={() => setShowExtractDialog(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Extract New Insights
          </Button>
        </div>
      )}

      {/* Filters */}
      {!resourceId && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Persona</span>
                  </div>
                  <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                    <SelectTrigger className="w-[180px] bg-background border-border/60">
                      <SelectValue placeholder="All Personas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Personas</SelectItem>
                      {allData?.[0]?.personas?.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id.toString()}>
                          {persona.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Resource</span>
                  </div>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger className="w-[180px] bg-background border-border/60">
                      <SelectValue placeholder="All Resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {allData?.[0]?.resourceContents?.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id.toString()}>
                          {resource.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {(selectedPersona !== "all" || selectedResource !== "all") && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {selectedPersona !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      {allData?.[0]?.personas?.find(p => p.id.toString() === selectedPersona)?.name}
                    </Badge>
                  )}
                  {selectedResource !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {allData?.[0]?.resourceContents?.find(r => r.id.toString() === selectedResource)?.title}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedPersona("all");
                    setSelectedResource("all");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      ) : insights.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-1">No insights yet</p>
            <p className="text-sm text-muted-foreground">
              {resourceId 
                ? "Extract insights from this resource to get started"
                : "Upload resources and extract insights to see them here"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="border rounded-lg overflow-hidden bg-card hover:bg-muted/30 transition-colors"
            >
              {/* Header - always visible */}
              <div className="flex items-center justify-between pt-2 p-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Expand/Collapse button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(insight.id);
                    }}
                    className="shrink-0 p-1 mt-2 h-8 w-8"
                  >
                    {isExpanded(insight.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Title and basic info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        

                        {/* Metadata badges */}
                        <div className="flex flex-wrap gap-2 pt-2 -ml-1 mb-1">
                          {insight.persona && (
                            <Badge variant="secondary" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {insight.persona.name}
                            </Badge>
                          )}
                          {insight.resourceContent && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {insight.resourceContent.title}
                            </Badge>
                          )}
                        </div>
                        <Link 
                          href={`/gw/insights/${insight.id}`}
                          className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors"
                        >
                          {insight.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3 w-3" />
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="shrink-0"
                  >
                    <Link
                      href={`/gw/generate?insight=${insight.id}${insight.persona?.id ? `&persona=${insight.persona.id}` : ''}`}
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs">Generate</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(insight);
                    }}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              
              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded(insight.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                      {/* All key points */}
                      <div className="space-y-3 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Key Points ({insight.keyPoints.length})
                          </h4>
                          <ul className="space-y-2">
                            {insight.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-primary font-medium mt-0.5 shrink-0">
                                  {index + 1}.
                                </span>
                                <span className="text-muted-foreground">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(currentPage > 1 || hasMore) && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}

      <ExtractInsightsDialog
        open={showExtractDialog}
        onOpenChange={setShowExtractDialog}
        resourceId={resourceId!}
        resourceTitle={resource?.title}
        onSuccess={() => {
          // Refresh the current insights list
          queryClient.invalidateQueries({ queryKey: trpc.gw.insights.list.queryKey() });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteInsightId} onOpenChange={() => setDeleteInsightId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{insightToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteInsightId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}