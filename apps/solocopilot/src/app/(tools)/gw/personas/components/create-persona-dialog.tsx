"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Plus, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import type { Ghostwriter } from "@repo/zod-types";

const manualFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(10, "Persona content must be at least 10 characters"),
});

const extractFormSchema = z.object({
  gwId: z.string().min(1, "Please select a ghostwriter"),
});

interface CreatePersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ghostwriters: Ghostwriter[];
}

export function CreatePersonaDialog({ 
  open, 
  onOpenChange, 
  ghostwriters 
}: CreatePersonaDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"manual" | "extract">("manual");
  
  // Manual form
  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
    },
  });
  
  // Extract form
  const extractForm = useForm<z.infer<typeof extractFormSchema>>({
    resolver: zodResolver(extractFormSchema),
    defaultValues: {
      gwId: "",
    },
  });
  
  // Create mutation for manual mode
  const createPersonaOptions = trpc.gw.persona.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Persona created successfully!");
      manualForm.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to create persona: ${error.message}`);
    }
  });
  const createPersona = useMutation(createPersonaOptions);
  
  // Extract mutation
  const extractPersonaOptions = trpc.gw.persona.extract.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Persona extracted successfully!");
      extractForm.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to extract persona: ${error.message}`);
    }
  });
  const extractPersona = useMutation(extractPersonaOptions);
  
  const onManualSubmit = async (data: z.infer<typeof manualFormSchema>) => {
    await createPersona.mutateAsync(data);
  };
  
  const onExtractSubmit = async (data: z.infer<typeof extractFormSchema>) => {
    await extractPersona.mutateAsync(data);
  };
  
  const isLoading = createPersona.isPending || extractPersona.isPending;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Persona</DialogTitle>
          <DialogDescription>
            Create a target audience profile for tailored content generation
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(v) => setMode(v as "manual" | "extract")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <User className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="extract">
              <UserCheck className="h-4 w-4 mr-2" />
              Extract
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                <FormField
                  control={manualForm.control}
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
                  control={manualForm.control}
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
                  control={manualForm.control}
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
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Persona
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="extract" className="space-y-4">
            <Form {...extractForm}>
              <form onSubmit={extractForm.handleSubmit(onExtractSubmit)} className="space-y-4">
                <FormField
                  control={extractForm.control}
                  name="gwId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Ghostwriter</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {ghostwriters.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              No ghostwriters available. Create one first to extract personas.
                            </p>
                          ) : (
                            <div className="grid gap-2">
                              {ghostwriters.map((writer) => (
                                <label
                                  key={writer.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    field.value === writer.id.toString()
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:bg-muted/50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value={writer.id.toString()}
                                    checked={field.value === writer.id.toString()}
                                    onChange={field.onChange}
                                    className="sr-only"
                                  />
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                      {writer.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium">{writer.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Analyze writing samples to extract target audience
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        AI will analyze the ghostwriter's content to identify their target audience
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
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || ghostwriters.length === 0}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Extract Persona
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}