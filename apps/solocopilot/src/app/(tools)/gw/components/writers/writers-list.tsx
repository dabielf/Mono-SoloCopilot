"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { 
  Plus, 
  Sparkles, 
  Settings, 
  Calendar, 
  Brain,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function WritersList() {
  const trpc = useTRPC();
  const { data: overview, isLoading } = useQuery(trpc.gw.listAll.queryOptions());

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const ghostwriters = overview?.[0]?.ghostwriters || [];

  if (ghostwriters.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Create New Button */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/gw/writers/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Ghostwriter
          </Link>
        </Button>
      </div>

      {/* Writers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ghostwriters.map((writer, index) => (
          <motion.div
            key={writer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GhostwriterCard writer={writer} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GhostwriterCard({ writer }: { writer: any }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteGwMutationOptions = trpc.gw.ghostwriter.delete.mutationOptions({
    onSuccess: () => {
      toast.success("Ghostwriter deleted successfully!");
      // Invalidate the listAll query to refresh the data
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
    },
    onError: (error) => {
      console.error("Failed to delete ghostwriter:", error);
      toast.error("Failed to delete ghostwriter. Please try again.");
    }
  });
  const deleteGwMutation = useMutation(deleteGwMutationOptions);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    await deleteGwMutation.mutateAsync({ id: writer.id });
    toast.success(`${writer.name} was deleted successfully!`);
  };

  const handleEdit = () => {
    toast.info("Edit functionality coming soon!");
  };

  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                  {writer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Active status indicator */}
              <motion.div 
                className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {writer.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                Created {formatDate(writer.createdAt)}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Profile Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3 text-blue-500" />
            <Badge variant={writer.psyProfileId ? "secondary" : "outline"} className="text-xs">
              {writer.psyProfileId ? "Psychology ✓" : "Psychology"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-purple-500" />
            <Badge variant={writer.writingProfileId ? "secondary" : "outline"} className="text-xs">
              {writer.writingProfileId ? "Writing ✓" : "Writing"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center p-2 rounded bg-muted/30">
            <div className="font-semibold">0</div>
            <div className="text-muted-foreground">Generations</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <div className="font-semibold">Ready</div>
            <div className="text-muted-foreground">Status</div>
          </div>
        </div>

        {/* Actions */}
        <motion.div 
          className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        >
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/gw/generate?writer=${writer.id}`}>
              <Sparkles className="h-3 w-3 mr-1" />
              Generate
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/gw/writers/${writer.id}`}>
              <Settings className="h-3 w-3" />
            </Link>
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="h-12 w-12 text-primary/50" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">No Ghostwriters Yet</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Create your first AI ghostwriter by uploading some writing samples. 
          The AI will learn your unique style and help you generate content that sounds just like you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/gw/writers/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Ghostwriter
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/gw/resources">
              <FileText className="h-4 w-4 mr-2" />
              Upload Resources First
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}