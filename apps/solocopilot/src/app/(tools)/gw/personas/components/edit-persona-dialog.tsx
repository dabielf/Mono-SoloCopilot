"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Persona } from "@repo/zod-types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(10, "Persona content must be at least 10 characters"),
});

interface EditPersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
}

export function EditPersonaDialog({ 
  open, 
  onOpenChange, 
  persona 
}: EditPersonaDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Fetch full persona details when dialog opens
  const { data: fullPersona, isLoading: personaLoading } = useQuery({
    ...trpc.gw.persona.get.queryOptions({ id: persona.id }),
    enabled: open, // Only fetch when dialog is open
  });
  
  // Use full persona data if available, fallback to basic persona data
  const personaData = fullPersona || persona;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: personaData.name,
      description: personaData.description || "",
      content: personaData.content || "",
    },
  });
  
  // Reset form when persona data changes
  useEffect(() => {
    form.reset({
      name: personaData.name,
      description: personaData.description || "",
      content: personaData.content || "",
    });
  }, [personaData, form]);
  
  // Update mutation
  const updatePersonaOptions = trpc.gw.persona.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Persona updated successfully!");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update persona: ${error.message}`);
    }
  });
  const updatePersona = useMutation(updatePersonaOptions);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await updatePersona.mutateAsync({
      id: persona.id,
      ...data,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Persona</DialogTitle>
          <DialogDescription>
            Update the persona profile details
          </DialogDescription>
        </DialogHeader>
        
        {personaLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading persona details...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tech-savvy Entrepreneur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief description of this persona" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona Definition</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the demographics, interests, goals, pain points, and characteristics of this persona..."
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific about their background, motivations, and how they consume content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={updatePersona.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePersona.isPending}>
                {updatePersona.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}