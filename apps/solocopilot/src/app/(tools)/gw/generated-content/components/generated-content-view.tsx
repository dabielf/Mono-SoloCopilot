"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
  History, 
  Trash2, 
  User,
  Brain,
  Pen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Users
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { GeneratedContentWithRelations } from "@repo/zod-types";
import { EditContentDialog } from "./edit-content-dialog";

interface GeneratedContentViewProps {
  writingProfileId?: string;
  psyProfileId?: string;
  personaId?: string;
  ghostwriterId?: string;
}

export function GeneratedContentView({ 
  writingProfileId: initialWritingProfileId,
  psyProfileId: initialPsyProfileId,
  personaId: initialPersonaId,
  ghostwriterId: initialGhostwriterId
}: GeneratedContentViewProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteContentId, setDeleteContentId] = useState<number | null>(null);
  const [contentToDelete, setContentToDelete] = useState<GeneratedContentWithRelations | null>(null);
  const [expandedContent, setExpandedContent] = useState<Set<number>>(new Set());
  const [selectedWritingProfile, setSelectedWritingProfile] = useState<string>(initialWritingProfileId || "all");
  const [selectedPsyProfile, setSelectedPsyProfile] = useState<string>(initialPsyProfileId || "all");
  const [selectedPersona, setSelectedPersona] = useState<string>(initialPersonaId || "all");
  const [selectedGhostwriter, setSelectedGhostwriter] = useState<string>(initialGhostwriterId || "all");
  const [editContent, setEditContent] = useState<GeneratedContentWithRelations | null>(null);

  // Query all data for filter dropdowns
  const { data: allData } = useQuery(trpc.gw.listAll.queryOptions());
  
  // Query generated content with filters
  const { data: contentData, isLoading } = useQuery(
    trpc.gw.generatedContent.list.queryOptions({ 
      writingProfileId: selectedWritingProfile !== "all" ? Number(selectedWritingProfile) : undefined,
      psyProfileId: selectedPsyProfile !== "all" ? Number(selectedPsyProfile) : undefined,
      personaId: selectedPersona !== "all" ? Number(selectedPersona) : undefined,
      ghostwriterId: selectedGhostwriter !== "all" ? Number(selectedGhostwriter) : undefined,
      page: currentPage, 
      limit: 20 
    })
  );

  // Delete mutation
  const deleteContentOptions = trpc.gw.generatedContent.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.generatedContent.list.queryKey() });
      toast.success("Generated content deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete content: " + error.message);
    }
  });
  const deleteContent = useMutation(deleteContentOptions);

  const content = contentData?.data || [];
  const hasMore = contentData?.meta?.hasMore || false;

  const handleDeleteClick = (content: GeneratedContentWithRelations) => {
    setContentToDelete(content);
    setDeleteContentId(content.id);
  };

  const handleDeleteConfirm = () => {
    if (deleteContentId) {
      deleteContent.mutate({ id: deleteContentId });
      setDeleteContentId(null);
      setContentToDelete(null);
    }
  };

  const toggleExpanded = (contentId: number) => {
    setExpandedContent(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const isExpanded = (contentId: number) => expandedContent.has(contentId);


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Generated Content</h1>
          <Badge variant="secondary" className="text-sm font-light">
            {contentData?.meta?.total || 0} items
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Browse and manage all your generated content
        </p>
      </div>

      {/* Filters */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filter by</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Pen className="h-4 w-4" />
                  <span>Writing Style</span>
                </div>
                <Select value={selectedWritingProfile} onValueChange={setSelectedWritingProfile}>
                  <SelectTrigger className="w-[180px] bg-background border-border/60">
                    <SelectValue placeholder="All Styles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Styles</SelectItem>
                    {allData?.[0]?.writingProfiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4" />
                  <span>Psychology</span>
                </div>
                <Select value={selectedPsyProfile} onValueChange={setSelectedPsyProfile}>
                  <SelectTrigger className="w-[180px] bg-background border-border/60">
                    <SelectValue placeholder="All Profiles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Profiles</SelectItem>
                    {allData?.[0]?.psyProfiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  <Users className="h-4 w-4" />
                  <span>Writer</span>
                </div>
                <Select value={selectedGhostwriter} onValueChange={setSelectedGhostwriter}>
                  <SelectTrigger className="w-[180px] bg-background border-border/60">
                    <SelectValue placeholder="All Writers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Writers</SelectItem>
                    {allData?.[0]?.ghostwriters?.map((ghostwriter) => (
                      <SelectItem key={ghostwriter.id} value={ghostwriter.id.toString()}>
                        {ghostwriter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {(selectedWritingProfile !== "all" || selectedPsyProfile !== "all" || selectedPersona !== "all" || selectedGhostwriter !== "all") && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {selectedWritingProfile !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    <Pen className="h-3 w-3" />
                    {allData?.[0]?.writingProfiles?.find(p => p.id.toString() === selectedWritingProfile)?.name}
                  </Badge>
                )}
                {selectedPsyProfile !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    <Brain className="h-3 w-3" />
                    {allData?.[0]?.psyProfiles?.find(p => p.id.toString() === selectedPsyProfile)?.name}
                  </Badge>
                )}
                {selectedPersona !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    {allData?.[0]?.personas?.find(p => p.id.toString() === selectedPersona)?.name}
                  </Badge>
                )}
                {selectedGhostwriter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {allData?.[0]?.ghostwriters?.find(g => g.id.toString() === selectedGhostwriter)?.name}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedWritingProfile("all");
                  setSelectedPsyProfile("all");
                  setSelectedPersona("all");
                  setSelectedGhostwriter("all");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      ) : content.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-1">No content generated yet</p>
            <p className="text-sm text-muted-foreground">
              Generate some content to see it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {content.map((item) => (
            <div
              key={item.id}
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
                      toggleExpanded(item.id);
                    }}
                    className="shrink-0 p-1 mt-2 h-8 w-8"
                  >
                    {isExpanded(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Title and metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        {/* Metadata badges */}
                        <div className="flex flex-wrap gap-2 pt-2 -ml-1 mb-1">
                          {item.writingProfile && (
                            <Badge variant="secondary" className="text-xs">
                              <Pen className="h-3 w-3 mr-1" />
                              {item.writingProfile.name}
                            </Badge>
                          )}
                          {item.psyProfile && (
                            <Badge variant="secondary" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              {item.psyProfile.name}
                            </Badge>
                          )}
                          {item.persona && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {item.persona.name}
                            </Badge>
                          )}
                          {item.ghostwriter && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {item.ghostwriter.name}
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium text-foreground line-clamp-1">
                          {item.prompt.length > 100 ? `${item.prompt.substring(0, 100)}...` : item.prompt}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditContent(item);
                    }}
                    className="shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item);
                    }}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              
              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded(item.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                      <div className="space-y-3 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Generated Content</h4>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {item.content}
                          </div>
                        </div>
                        {item.userFeedBack && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">User Feedback</h4>
                            <div className="text-sm text-muted-foreground">
                              {item.userFeedBack}
                            </div>
                          </div>
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContentId} onOpenChange={() => setDeleteContentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Generated Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this generated content? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteContentId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Content Dialog */}
      {editContent && (
        <EditContentDialog
          open={!!editContent}
          onOpenChange={(open) => {
            if (!open) setEditContent(null);
          }}
          content={editContent}
        />
      )}
    </div>
  );
}