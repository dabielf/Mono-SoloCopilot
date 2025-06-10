"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Sliders, 
  Sparkles, 
  Info, 
  Plus, 
  X, 
  Lightbulb,
  Loader2,
  Download,
  Save,
  Copy,
  FileText,
  FileCode
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type GenerationMode = "writer" | "custom";

export function GenerationWorkspace() {
  const trpc = useTRPC();
  const { data: overview } = useQuery(trpc.gw.listAll.queryOptions());
  
  // Generation state
  const [mode, setMode] = useState<GenerationMode>("writer");
  const [selectedWriter, setSelectedWriter] = useState<string>("");
  const [selectedPsyProfile, setSelectedPsyProfile] = useState<string>("");
  const [selectedWritingProfile, setSelectedWritingProfile] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const data = overview?.[0];
  const ghostwriters = data?.ghostwriters || [];
  const psyProfiles = data?.psyProfiles || [];
  const writingProfiles = data?.writingProfiles || [];
  const personas = data?.personas || [];

  // TRPC mutations
  const generateContentMutationOptions = trpc.gw.content.generate.mutationOptions({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast.success("Content generated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to generate content. Please try again.");
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });
  const generateContentMutation = useMutation(generateContentMutationOptions);

  const saveContentMutationOptions = trpc.gw.content.save.mutationOptions({
    onSuccess: () => {
      toast.success("Content saved to history!");
    },
    onError: (error) => {
      console.error("Failed to save content:", error);
      toast.error("Failed to save content. Please try again.");
    },
  });
  const saveContentMutation = useMutation(saveContentMutationOptions);

  const handleGenerate = async () => {
    if (mode === "writer" && !selectedWriter) {
      toast.error("Please select a ghostwriter");
      return;
    }
    
    if (mode === "custom" && (!selectedPsyProfile || !selectedWritingProfile)) {
      toast.error("Please select both psychology and writing profiles");
      return;
    }

    if (!instructions.trim()) {
      toast.error("Please provide instructions for content generation");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare the payload based on the mode
      const payload = mode === "writer" 
        ? { 
            gwId: selectedWriter,
            personaProfileId: selectedPersona || undefined,
            topic: instructions,
            insightId: selectedInsights.length > 0 ? selectedInsights[0] : undefined
          }
        : { 
            psychologyProfileId: selectedPsyProfile,
            writingProfileId: selectedWritingProfile,
            personaProfileId: selectedPersona || undefined,
            topic: instructions,
            insightId: selectedInsights.length > 0 ? selectedInsights[0] : undefined
          };
      
      await generateContentMutation.mutateAsync(payload);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const exportContent = (format: "txt" | "md") => {
    if (!generatedContent) {
      toast.error("No content to export");
      return;
    }

    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-content-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Content exported as .${format}`);
  };

  const copyToClipboard = () => {
    if (!generatedContent) {
      toast.error("No content to copy");
      return;
    }
    
    navigator.clipboard.writeText(generatedContent);
    toast.success("Content copied to clipboard!");
  };

  const saveContent = async () => {
    if (!generatedContent) {
      toast.error("No content to save");
      return;
    }
    
    try {
      // Prepare the save payload
      const payload = {
        content: generatedContent,
        gwId: mode === "writer" ? selectedWriter : undefined,
        psyProfileId: mode === "custom" ? selectedPsyProfile : (selectedPsyProfile || undefined),
        writingProfileId: mode === "custom" ? selectedWritingProfile : (selectedWritingProfile || undefined),
        personaProfileId: selectedPersona || undefined,
        prompt: instructions,
        userFeedback: undefined, // Can be added later
        isTrainingData: false, // Default to false, user can mark later
      };
      
      await saveContentMutation.mutateAsync(payload);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Error in saveContent:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex w-full h-full">
        {/* Configuration Panel */}
        <div className="w-96 border-r bg-muted/10">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Content Generation</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6 overflow-auto">
              {/* Mode Switcher */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Generation Mode</Label>
                <Tabs value={mode} onValueChange={(value) => setMode(value as GenerationMode)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="writer" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Writer Mode
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Custom Mode
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4">
                    <TabsContent value="writer" className="space-y-4 mt-0">
                      <div>
                        <Label htmlFor="writer-select">Select Ghostwriter</Label>
                        <Select value={selectedWriter} onValueChange={setSelectedWriter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your ghostwriter" />
                          </SelectTrigger>
                          <SelectContent>
                            {ghostwriters.map((writer) => (
                              <SelectItem key={writer.id} value={writer.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs">
                                      {writer.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {writer.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="persona-select">Target Persona (Optional)</Label>
                        <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                          <SelectContent>
                            {personas.map((persona) => (
                              <SelectItem key={persona.id} value={persona.id.toString()}>
                                {persona.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="custom" className="space-y-4 mt-0">
                      <div>
                        <Label htmlFor="psy-profile-select">Psychology Profile</Label>
                        <Select value={selectedPsyProfile} onValueChange={setSelectedPsyProfile}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select psychology profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {psyProfiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id.toString()}>
                                {profile.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="writing-profile-select">Writing Style</Label>
                        <Select value={selectedWritingProfile} onValueChange={setSelectedWritingProfile}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select writing style" />
                          </SelectTrigger>
                          <SelectContent>
                            {writingProfiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id.toString()}>
                                {profile.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="persona-custom-select">Target Persona (Optional)</Label>
                        <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                          <SelectContent>
                            {personas.map((persona) => (
                              <SelectItem key={persona.id} value={persona.id.toString()}>
                                {persona.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Instructions Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Provide any instructions for your content:</p>
                      <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                        <li>Simple topic: "Write about AI ethics"</li>
                        <li>Draft to polish: Paste your rough draft</li>
                        <li>Specific format: "Create a LinkedIn post about..."</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="instructions"
                  placeholder="Enter your topic, draft, or specific instructions..."
                  className="min-h-[100px] resize-none"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              {/* Insight Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Insights (Optional)</Label>
                  <Badge variant="secondary" className="text-xs">
                    {selectedInsights.length} selected
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.info("Insight selection coming soon!")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add insights to include
                </Button>
                
                {selectedInsights.length > 0 && (
                  <div className="space-y-1">
                    {selectedInsights.map((id) => (
                      <div key={id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                        <Lightbulb className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate flex-1">Insight {id}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedInsights(prev => prev.filter(i => i !== id))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      className="flex items-center gap-2"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating magic...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="generate"
                      className="flex items-center gap-2"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Content
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 rounded-none border-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Content</CardTitle>
                
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => exportContent("txt")}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as .txt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportContent("md")}>
                          <FileCode className="h-4 w-4 mr-2" />
                          Export as .md
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyToClipboard}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to clipboard
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button onClick={saveContent}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6 flex-1">
              <div className="relative h-full">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="h-full min-h-[400px] resize-none border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="Your generated content will appear here like magic..."
                />
                
                {generatedContent && (
                  <motion.div
                    className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded"
                    key={generatedContent.split(" ").length}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {generatedContent.split(" ").length} words
                  </motion.div>
                )}
                
                {isGenerating && (
                  <motion.div
                    className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-12 w-12 text-primary mx-auto" />
                      </motion.div>
                      <div>
                        <p className="font-medium">Creating your content</p>
                        <p className="text-sm text-muted-foreground">This may take a few moments...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}