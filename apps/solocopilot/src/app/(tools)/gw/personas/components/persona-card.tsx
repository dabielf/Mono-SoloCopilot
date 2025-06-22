"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  Calendar,
  Lightbulb,
  Sparkles,
  FileSearch
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { Persona } from "@repo/zod-types";

// Utility function to safely format dates
function safeFormatDistanceToNow(dateString: string): string {
  try {
    // Handle different date formats
    let date: Date;
    
    // If it's already a valid date string
    if (typeof dateString === 'string') {
      // Try parsing as ISO string first
      date = new Date(dateString);
      
      // If that fails, try parsing as timestamp
      if (isNaN(date.getTime()) && !isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      }
    } else {
      // If it's a number (timestamp)
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.log("Invalid date:", dateString);
      return "Invalid date";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.log("Date formatting error:", error, dateString);
    return "Invalid date";
  }
}

interface PersonaCardProps {
  persona: Persona;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PersonaCard({ persona, onView, onEdit, onDelete }: PersonaCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Get initials for avatar
  const initials = persona.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  // Format created date safely
  const createdDate = safeFormatDistanceToNow(persona.createdAt);
  
  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{persona.name}</h3>
              {persona.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {persona.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{createdDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={onView}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => {
                    // Navigate to insights with persona filter
                    window.location.href = `/gw/insights?personaId=${persona.id}`;
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  View Insights
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    // Navigate to resources to extract insights
                    window.location.href = `/gw/resources?extractFor=${persona.id}`;
                  }}
                >
                  <FileSearch className="h-4 w-4 mr-2" />
                  Extract Insights
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    // Navigate to generate with persona pre-selected
                    window.location.href = `/gw/generate?personaId=${persona.id}`;
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Persona
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Persona?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{persona.name}" and all associated insights. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}