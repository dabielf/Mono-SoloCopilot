"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { PsyProfile, WritingProfile } from "@repo/zod-types";

interface ViewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PsyProfile | WritingProfile | null;
  type: "psychology" | "writing";
}

export function ViewProfileDialog({ open, onOpenChange, profile, type }: ViewProfileDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {type === "psychology" ? "Psychology" : "Writing"} Profile: {profile.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 mt-4">
          <div className="pr-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {profile.content}
            </pre>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}