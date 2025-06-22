"use client";

import { useState } from "react";
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Sliders, 
  Sparkles, 
  Info, 
  X, 
  Lightbulb,
  Loader2,
  Download,
  Save,
  Copy,
  FileText,
  FileCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { 
  InsightWithRelations, 
  GhostwriterList, 
  PsyProfileList, 
  WritingProfileList, 
  PersonaList 
} from "@repo/zod-types";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGwSocket } from "@/hooks/use-socket";

type GenerationMode = "writer" | "custom";

export function GenerationWorkspace() {
  const trpc = useTRPC();
  const { data: overview } = useQuery(trpc.gw.listAll.queryOptions());
  const { sendMessage, onMessage } = useGwSocket('dabielf@gmail.com');
  const searchParams = useSearchParams();

  onMessage((message) => {
    const data = JSON.parse(message);
    console.log(data)
    if (data.type === "success") {
      setGeneratedContent(data.content);
      setIsGenerating(false);
    }
    if (data.type === "error") {
      toast.error(data.message);
      setIsGenerating(false);
    }
  });

  const writerId = searchParams.get("writer");
  const insightId = searchParams.get("insight");
  const personaId = searchParams.get("persona");
  
  // Generation state
  const [mode, setMode] = useState<GenerationMode>("writer");
  const [selectedWriter, setSelectedWriter] = useState<string>(writerId || "");
  const [selectedPsyProfile, setSelectedPsyProfile] = useState<string>("");
  const [selectedWritingProfile, setSelectedWritingProfile] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>(personaId || "");
  const [instructions, setInstructions] = useState("");
  const [selectedInsight, setSelectedInsight] = useState<string>(insightId || "");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsightDialog, setShowInsightDialog] = useState(false);

  const data = overview ? overview[0] : undefined;
  const ghostwriters: GhostwriterList[] = data?.ghostwriters || [];
  const psyProfiles: PsyProfileList[] = data?.psyProfiles || [];
  const writingProfiles: WritingProfileList[] = data?.writingProfiles || [];
  const personas: PersonaList[] = data?.personas || [];
  
  // Fetch insights when a persona is selected
  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    ...trpc.gw.insights.list.queryOptions({ 
      personaId: selectedPersona || undefined,
      page: 1,
      limit: 100 // Get all insights for the persona
    }),
    enabled: !!selectedPersona // Only fetch when a persona is selected
  });
  
  const insights: InsightWithRelations[] = (() => {
    if (!insightsData) return [];
    if (Array.isArray(insightsData)) return insightsData;
    if (insightsData.data && Array.isArray(insightsData.data)) return insightsData.data;
    return [];
  })();


  const saveContentMutationOptions = trpc.gw.content.save.mutationOptions({
    onSuccess: () => {
      toast.success("Content saved successfully!");
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

    if (!instructions.trim() && !selectedInsight) {
      toast.error("Please provide instructions for content generation");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare the payload based on the mode
      let payload;
      
      if (mode === "writer") {
        // Find the selected ghostwriter to get its profile IDs
        const writer = ghostwriters.find(w => w.id.toString() === selectedWriter);
        if (!writer || !writer.psyProfileId || !writer.writingProfileId) {
          toast.error("Selected ghostwriter doesn't have complete profiles");
          setIsGenerating(false);
          return;
        }
        
        payload = {
          psychologyProfileId: writer.psyProfileId.toString(),
          writingProfileId: writer.writingProfileId.toString(),
          gwId: selectedWriter,
          personaProfileId: selectedPersona || undefined,
          topic: instructions.trim() || undefined,
          insightId: selectedInsight || undefined
        };
      } else {
        payload = { 
          psychologyProfileId: selectedPsyProfile,
          writingProfileId: selectedWritingProfile,
          personaProfileId: selectedPersona || undefined,
          topic: instructions.trim() || undefined,
          insightId: selectedInsight || undefined
        };
      }
      
      sendMessage(JSON.stringify({ type: "generate", args:payload }));
      // await generateContentMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Failed to generate content:", error);
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
      let psyProfileId: string;
      let writingProfileId: string;
      
      if (mode === "writer") {
        // Find the selected ghostwriter to get its profile IDs
        const writer = ghostwriters.find(w => w.id.toString() === selectedWriter);
        if (!writer || !writer.psyProfileId || !writer.writingProfileId) {
          toast.error("Selected ghostwriter doesn't have complete profiles");
          return;
        }
        psyProfileId = writer.psyProfileId.toString();
        writingProfileId = writer.writingProfileId.toString();
      } else {
        psyProfileId = selectedPsyProfile;
        writingProfileId = selectedWritingProfile;
      }
      
      // Use instructions if provided, otherwise use the selected insight title as prompt
      const selectedInsightData = insights.find(i => i.id.toString() === selectedInsight);
      const promptText = selectedInsightData?.title || "Generated content";

      const payload = {
        content: generatedContent,
        gwId: mode === "writer" ? selectedWriter : undefined,
        psyProfileId,
        writingProfileId,
        personaProfileId: selectedPersona || undefined,
        prompt: instructions || promptText,
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
              <div className="flex items-center justify-between h-[60px]">
                <CardTitle className="text-lg">Content Generation</CardTitle>
                <div className="w-[140px]"></div> {/* Spacer to match right panel button width */}
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6 overflow-auto">
              {/* Mode Switcher */}
              <div>
                <Label className="text-sm font-medium -mt-6 mb-3 block">Generation Mode</Label>
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
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Persona Selection - Shared between both modes */}
              <div>
                <Label htmlFor="persona-select">Target Persona (Optional)</Label>
                <Select 
                  value={selectedPersona} 
                  onValueChange={(value) => {
                    setSelectedPersona(value);
                    setSelectedInsight(""); // Reset insight when persona changes
                    if (value) {
                      refetchInsights(); // Refetch insights for new persona
                    }
                  }}
                >
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
                        <li>Simple topic: &quot;Write about AI ethics&quot;</li>
                        <li>Draft to polish: Paste your rough draft</li>
                        <li>Specific format: &quot;Create a LinkedIn post about...&quot;</li>
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

              {/* Insight Selection - Show button when persona is selected */}
              {selectedPersona && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Include Insight (Optional)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Select an insight to include specific knowledge from your resources in the generated content.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {!selectedInsight ? (
                    <Dialog open={showInsightDialog} onOpenChange={setShowInsightDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" disabled={insightsLoading || insights.length === 0}>
                          {insightsLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading insights...
                            </>
                          ) : insights.length === 0 ? (
                            <>
                              <Lightbulb className="h-4 w-4 mr-2" />
                              No insights available
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Select an insight
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Select an Insight</DialogTitle>
                          <DialogDescription>
                            Choose an insight to include in your content generation
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto">
                          <RadioGroup value={selectedInsight} onValueChange={(value) => {
                            setSelectedInsight(value);
                            setShowInsightDialog(false);
                          }}>
                            <div className="space-y-3">
                              {insights.map((insight) => (
                                <div key={insight.id} className="flex items-start space-x-3">
                                  <RadioGroupItem value={insight.id.toString()} id={`dialog-insight-${insight.id}`} className="mt-1" />
                                  <Label 
                                    htmlFor={`dialog-insight-${insight.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="p-3 hover:bg-muted/50 rounded-lg transition-colors border">
                                      <div className="flex items-start gap-2">
                                        <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{insight.title}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            From: {insight.resourceContent?.title}
                                          </p>
                                          <div className="mt-2">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Key points:</p>
                                            <ul className="text-xs text-muted-foreground space-y-1">
                                              {insight.keyPoints.map((point, index) => (
                                                <li key={index} className="flex items-start gap-1">
                                                  <span className="text-primary">•</span>
                                                  <span>{point}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setSelectedInsight("")}
                      >
                        <X className="h-4 w-4 text-destructive mr-2" />
                        Clear insight
                      </Button>
                      
                      {/* Show selected insight details */}
                      {(() => {
                        const selectedInsightData = insights.find(i => i.id.toString() === selectedInsight);
                        if (!selectedInsightData) return null;
                        
                        return (
                          <div className="p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm">{selectedInsightData.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              From: {selectedInsightData.resourceContent?.title}
                            </p>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Key Points:</p>
                              <ul className="space-y-1">
                                {selectedInsightData.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs">
                                    <span className="text-primary font-medium mt-0.5 shrink-0">
                                      {index + 1}.
                                    </span>
                                    <span className="text-muted-foreground">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

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
              <div className="flex items-center justify-between h-[60px]">
                <CardTitle className="text-lg">Generated Content</CardTitle>
                
                <div className="flex items-center gap-2 w-[140px] justify-end">
                  {generatedContent && (
                    <>
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
                    </>
                  )}
                </div>
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