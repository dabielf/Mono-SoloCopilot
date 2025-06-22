"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PersonaCard } from "./persona-card";
import { CreatePersonaDialog } from "./create-persona-dialog";
import { EditPersonaDialog } from "./edit-persona-dialog";
import { ViewPersonaDialog } from "./view-persona-dialog";
import type { Persona } from "@repo/zod-types";

export function PersonasView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [viewingPersona, setViewingPersona] = useState<Persona | null>(null);
  
  // Fetch all user data including personas
  const { data, isLoading } = useQuery(trpc.gw.listAll.queryOptions());
  const personas = data?.[0]?.personas || [];
  
  
  // Filter personas based on search
  const filteredPersonas = personas.filter(persona => 
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (persona.description && persona.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Delete mutation
  const deletePersonaOptions = trpc.gw.persona.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Persona deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete persona: ${error.message}`);
    }
  });
  const deletePersona = useMutation(deletePersonaOptions);
  
  const handleDelete = async (id: number) => {
    await deletePersona.mutateAsync({ id });
  };
  
  if (isLoading) {
    return null; // The Suspense boundary will show the skeleton
  }
  
  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search personas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Persona
        </Button>
      </div>
      
      {/* Empty state */}
      {filteredPersonas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No personas found matching your search" 
              : "No personas created yet"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Persona
            </Button>
          )}
        </div>
      )}
      
      {/* Personas grid */}
      {filteredPersonas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onView={() => setViewingPersona(persona)}
              onEdit={() => setEditingPersona(persona)}
              onDelete={() => handleDelete(persona.id)}
            />
          ))}
        </div>
      )}
      
      {/* Dialogs */}
      <CreatePersonaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        ghostwriters={data?.[0]?.ghostwriters || []}
      />
      
      {editingPersona && (
        <EditPersonaDialog
          open={!!editingPersona}
          onOpenChange={(open) => !open && setEditingPersona(null)}
          persona={editingPersona}
        />
      )}
      
      {viewingPersona && (
        <ViewPersonaDialog
          open={!!viewingPersona}
          onOpenChange={(open) => !open && setViewingPersona(null)}
          persona={viewingPersona}
          resources={data?.[0]?.resourceContents || []}
        />
      )}
    </div>
  );
}