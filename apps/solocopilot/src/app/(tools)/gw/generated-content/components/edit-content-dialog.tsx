"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedContentWithRelations } from "@repo/zod-types";

interface EditContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: GeneratedContentWithRelations;
}

export function EditContentDialog({ 
  open, 
  onOpenChange, 
  content
}: EditContentDialogProps) {
  const [editedContent, setEditedContent] = useState(content.content);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Update content mutation
  const updateContentMutationOptions = trpc.gw.generatedContent.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.gw.generatedContent.list.queryKey() 
      });
      toast.success("Content updated successfully!");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update content: ${error.message}`);
    }
  });
  const updateContentMutation = useMutation(updateContentMutationOptions);

  const handleSave = () => {
    if (editedContent.trim() === content.content.trim()) {
      onOpenChange(false);
      return;
    }
    updateContentMutation.mutate({
      id: content.id,
      content: editedContent,
    });
  };

  const handleCancel = () => {
    setEditedContent(content.content);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Generated Content</DialogTitle>
          <DialogDescription>
            Make changes to your generated content. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="flex-1 resize-none"
            placeholder="Enter your content here..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateContentMutation.isPending || editedContent.trim() === content.content.trim()}
          >
            {updateContentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}