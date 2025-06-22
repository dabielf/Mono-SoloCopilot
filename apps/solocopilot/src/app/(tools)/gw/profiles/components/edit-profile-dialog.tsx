"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PsyProfile, WritingProfile } from "@repo/zod-types";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PsyProfile | WritingProfile | null;
  type: "psychology" | "writing";
}

export function EditProfileDialog({ open, onOpenChange, profile, type }: EditProfileDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"base" | "customize">("base");
  const [name, setName] = useState(profile?.name || "");
  const [modifications, setModifications] = useState("");
  
  // Reset state when profile changes
  if (profile && name !== profile.name) {
    setName(profile.name);
  }

  // Update mutations
  const updatePsyProfileOptions = trpc.gw.psyProfile.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
  const updatePsyProfile = useMutation(updatePsyProfileOptions);

  const updateWritingProfileOptions = trpc.gw.writingProfile.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
  const updateWritingProfile = useMutation(updateWritingProfileOptions);

  // Customize mutations
  const customizePsyProfileOptions = trpc.gw.psyProfile.customize.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Profile customized successfully!");
      setModifications("");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to customize profile");
    },
  });
  const customizePsyProfile = useMutation(customizePsyProfileOptions);

  const customizeWritingProfileOptions = trpc.gw.writingProfile.customize.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Profile customized successfully!");
      setModifications("");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to customize profile");
    },
  });
  const customizeWritingProfile = useMutation(customizeWritingProfileOptions);

  if (!profile) return null;

  const handleBaseInfoSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (type === "psychology") {
      await updatePsyProfile.mutateAsync({ id: profile.id, name });
    } else {
      await updateWritingProfile.mutateAsync({ id: profile.id, name });
    }
  };

  const handleCustomize = async () => {
    if (!modifications.trim()) {
      toast.error("Please provide modification instructions");
      return;
    }

    if (type === "psychology") {
      await customizePsyProfile.mutateAsync({ id: profile.id, modifications });
    } else {
      await customizeWritingProfile.mutateAsync({ id: profile.id, modifications });
    }
  };

  const isUpdating = updatePsyProfile.isPending || updateWritingProfile.isPending;
  const isCustomizing = customizePsyProfile.isPending || customizeWritingProfile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit {type === "psychology" ? "Psychology" : "Writing"} Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "base" | "customize")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="base">Base Info</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Profile Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleBaseInfoSave} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="modifications">Modification Instructions</Label>
              <Textarea
                id="modifications"
                value={modifications}
                onChange={(e) => setModifications(e.target.value)}
                placeholder={
                  type === "psychology"
                    ? "e.g., Make it more focused on entrepreneurship and business growth..."
                    : "e.g., Make the writing style more formal and academic..."
                }
                className="min-h-[150px]"
              />
              <p className="text-sm text-muted-foreground">
                Describe how you want to modify this {type} profile. The AI will adapt the profile based on your instructions.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCustomizing}
              >
                Cancel
              </Button>
              <Button onClick={handleCustomize} disabled={isCustomizing}>
                {isCustomizing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Apply Modifications
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}