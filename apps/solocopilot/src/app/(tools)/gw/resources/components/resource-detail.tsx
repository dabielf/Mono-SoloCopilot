"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  FileText, 
  Calendar,
  ArrowLeft,
  Trash2,
  Lightbulb,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ResourceDetailProps {
  id: string;
}

export function ResourceDetail({ id }: ResourceDetailProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Query resource
  const { data: resource, isLoading, error } = useQuery(
    trpc.gw.resources.get.queryOptions({ id: Number(id) })
  );

  // Delete mutation
  const deleteResourceOptions = trpc.gw.resources.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("Resource deleted successfully!");
      router.push("/gw/resources");
    },
    onError: (error) => {
      toast.error("Failed to delete resource: " + error.message);
    }
  });
  const deleteResource = useMutation(deleteResourceOptions);

  const handleCopyContent = async () => {
    if (!resource) return;
    
    try {
      await navigator.clipboard.writeText(resource.content);
      setCopied(true);
      toast.success("Content copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const handleExtractInsights = () => {
    router.push(`/gw/insights?resourceId=${id}`);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/gw/resources")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">Resource not found</p>
            <p className="text-sm text-muted-foreground">
              This resource may have been deleted or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !resource) {
    return <ResourceDetailSkeleton />;
  }

  // Format date
  const createdDate = new Date(resource.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Calculate stats
  const wordCount = resource.content.split(/\s+/).filter(Boolean).length;
  const charCount = resource.content.length;
  const sizeInKB = Math.round(charCount / 1024);
  const formattedSize = sizeInKB > 1024 
    ? `${(sizeInKB / 1024).toFixed(1)} MB`
    : `${sizeInKB} KB`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/gw/resources")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={handleExtractInsights}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Extract Insights
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Resource Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {createdDate}
                  </span>
                  <Badge variant="secondary">Text Resource</Badge>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{wordCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Words</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{charCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Characters</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{formattedSize}</p>
              <p className="text-sm text-muted-foreground">Size</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="whitespace-pre-wrap break-words text-sm bg-muted/30 p-4 rounded-lg max-h-[600px] overflow-y-auto">
              {resource.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resource.title}"? This will also delete all insights extracted from this resource. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteResource.mutate({ id: Number(id) });
                setShowDeleteDialog(false);
              }}
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