# Ghostwriter Interface Planning Document

## Overview

This document outlines the complete interface design for the Ghostwriter tool, focusing on creating an **AMAZING, modern, and delightful user experience** with zero friction. The interface will be built at `/apps/solocopilot/src/app/(tools)/gw/` using Tailwind CSS, shadcn/ui, and modern React patterns.

## Design Philosophy

### Core Principles
1. **Delightful Interactions** - Every click should feel satisfying
2. **Zero Friction** - Remove all unnecessary steps
3. **Visual Excellence** - Modern, clean, with subtle animations
4. **Instant Feedback** - Users always know what's happening
5. **Progressive Disclosure** - Show complexity only when needed

### Visual Design Language
- **Spacing**: Generous whitespace for breathing room
- **Typography**: Clear hierarchy with modern fonts
- **Colors**: Subtle gradients, soft shadows, vibrant accents
- **Motion**: Smooth transitions (0.2s ease) for all interactions
- **Feedback**: Haptic-like responses through micro-animations

## Core User Value Proposition

**"Transform your writing samples into an AI that writes exactly like you, for any audience"**

Users can:
1. Upload writing samples and get an instant AI ghostwriter
2. Generate content that matches their unique voice and psychology
3. Create target personas for audience-specific content
4. Extract insights from resources to generate research-backed content
5. Continuously improve their ghostwriter through feedback

## User Journey & Flow Architecture

### 1. Entry Flow (First-time User)
```
Landing → Upload Samples → Processing → Ghostwriter Created → First Generation
```

### 2. Power User Flow (Returning User)
```
Dashboard → Select/Create Ghostwriter → Configure Generation → Generate → Review/Save
```

### 3. Research-Enhanced Flow
```
Dashboard → Upload Resources → Create Persona → Extract Insights → Generate with Insights
```

## Interface Structure & Navigation

### Main Layout: Sidebar + Content Area

```
┌─────────────┬─────────────────────────────────────┐
│   Sidebar   │            Content Area             │
│             │                                     │
│ • Dashboard │  ┌─ Header (Breadcrumb + Actions) ─┐ │
│ • Generate  │  │                                 │ │
│ • Writers   │  │                                 │ │
│ • Profiles  │  │         Main Content            │ │
│ • History   │  │                                 │ │
│ • Training  │  │                                 │ │
│ • Personas  │  │                                 │ │
│ • Resources │  └─────────────────────────────────┘ │
│ • Insights  │                                     │
└─────────────┴─────────────────────────────────────┘
```

### Navigation Hierarchy

1. **Dashboard** (`/gw`) - Overview of all data
2. **Generate** (`/gw/generate`) - Content generation workspace
3. **Ghostwriters** (`/gw/writers`) - Manage ghostwriter profiles
4. **Profiles** (`/gw/profiles`) - Psychology & Writing profiles management
5. **History** (`/gw/history`) - Generated content history & management
6. **Training** (`/gw/training`) - Profile improvement center
7. **Personas** (`/gw/personas`) - Target audience management
8. **Resources** (`/gw/resources`) - Document upload and management
9. **Insights** (`/gw/insights`) - Extracted knowledge base

## Detailed View Specifications

### 1. Dashboard View (`/gw`)

**Purpose**: Quick overview and rapid access to common actions

**Layout**: Card-based grid showing:
- Active ghostwriters (with quick generate buttons)
- Recent generations (with feedback options)
- Quick stats (total writers, personas, resources)
- Recent insights

**Key Actions**:
- "Create New Ghostwriter" (prominent CTA)
- "Quick Generate" buttons on writer cards
- "Upload Resource" quick action

**TRPC Integration**:
```typescript
// Server Component - prefetch overview data
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function DashboardPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - real-time updates
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

function DashboardContent() {
  const trpc = useTRPC();
  const { data: overview } = useQuery(trpc.gw.listAll.queryOptions());
  // ... component logic
}
```

### 2. Ghostwriters View (`/gw/writers`)

**Purpose**: Complete ghostwriter management

**Sub-routes**:
- `/gw/writers` - List view with cards
- `/gw/writers/new` - Creation wizard
- `/gw/writers/[id]` - Individual ghostwriter detail
- `/gw/writers/[id]/edit` - Edit profiles

**List View Features**:
- Sortable/filterable cards
- Psychology & Writing profile indicators
- Recent generation previews
- Quick actions (generate, edit, delete)

**Detail View Features**:
- Profile summaries (psychology + writing)
- Original content samples
- Generated content history with feedback
- Training controls

**TRPC Integration**:
```typescript
// Server Component - List view page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function WritersPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<WritersListSkeleton />}>
        <WritersList />
      </Suspense>
    </HydrateClient>
  );
}

// Server Component - Detail view page
export default async function WriterDetailPage({ params }: { params: { id: string } }) {
  await prefetch(trpc.gw.ghostwriter.get.queryOptions({ id: Number(params.id) }));
  await prefetch(trpc.gw.generatedContent.get.queryOptions({ gwid: Number(params.id) }));
  
  return (
    <HydrateClient>
      <Suspense fallback={<WriterDetailSkeleton />}>
        <WriterDetail id={params.id} />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - List view
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

function WritersList() {
  const trpc = useTRPC();
  const { data: writers } = useQuery(trpc.gw.listAll.queryOptions());
  // ... component logic
}

// Client Component - Detail view
function WriterDetail({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data: writer } = useQuery(
    trpc.gw.ghostwriter.get.queryOptions({ id: Number(id) })
  );
  const { data: generatedContent } = useQuery(
    trpc.gw.generatedContent.get.queryOptions({ gwid: Number(id) })
  );
  // ... component logic
}
```

### 3. Profiles View (`/gw/profiles`)

**Purpose**: Psychology & Writing profiles management with custom creation

**Layout**: Two-column tabs for Psychology vs Writing profiles

**Sub-routes**:
- `/gw/profiles` - Main view with tabs
- `/gw/profiles/psychology/new` - Create custom psychology profile
- `/gw/profiles/writing/new` - Create custom writing profile

**Features**:
- **Psychology Profiles Tab**:
  - Cards showing existing profiles with preview
  - "Create Custom Profile" button
  - Based on existing profiles with custom instructions
  
- **Writing Profiles Tab**:
  - Cards showing writing styles with preview
  - "Create Custom Profile" button
  - Derive from existing with modifications

**Profile Creation Interface**:
```tsx
const CustomProfileCreator = ({ type }: { type: 'psychology' | 'writing' }) => (
  <Card className="max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>Create Custom {type === 'psychology' ? 'Psychology' : 'Writing'} Profile</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label>Base Profile</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select existing profile to build from" />
          </SelectTrigger>
          <SelectContent>
            {existingProfiles.map(profile => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Profile Name</Label>
        <Input placeholder="My Custom Profile" />
      </div>
      
      <div>
        <div className="flex items-center gap-2">
          <Label>Customization Instructions</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Describe how to modify the base profile:</p>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>"Make it more formal and academic"</li>
                <li>"Add more humor and casual tone"</li>
                <li>"Focus on technical accuracy"</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea 
          placeholder="Describe how to modify the base profile..."
          className="min-h-[120px]"
        />
      </div>
      
      <Button className="w-full">
        <Sparkles className="h-4 w-4 mr-2" />
        Create Custom Profile
      </Button>
    </CardContent>
  </Card>
);
```

**TRPC Integration**:
```typescript
// Server Component - Profiles page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function ProfilesPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<ProfilesSkeleton />}>
        <ProfilesView />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - Profiles view
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function ProfilesView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const { data } = useQuery(trpc.gw.listAll.queryOptions());
  const psyProfiles = data?.[0]?.psyProfiles || [];
  const writingProfiles = data?.[0]?.writingProfiles || [];
  
  // Mutation for creating psychology profile
  const createPsyProfileOptions = trpc.gw.psyProfile.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Psychology profile created!");
    },
    onError: (error) => {
      toast.error("Failed to create profile");
    }
  });
  const createPsyProfile = useMutation(createPsyProfileOptions);
  
  // ... component logic
}
```

### 4. History View (`/gw/history`)

**Purpose**: Generated content management and training data curation

**Features**:
- **Content Grid**: Cards showing all generated content
- **Filtering**: By ghostwriter, date, training status
- **Batch Operations**: Mark multiple as training data
- **Export Options**: Individual or bulk export

**Content Cards Design**:
```tsx
const GeneratedContentCard = ({ content }: { content: GeneratedContent }) => (
  <Card className="group">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {content.prompt.slice(0, 60)}...
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(content.createdAt)}
            <Separator orientation="vertical" className="h-3" />
            <User className="h-3 w-3" />
            {getWriterName(content.ghostwriterId)}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => toggleTraining(content.id)}>
              {content.isTrainingData ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Remove from training
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Mark as training data
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportContent(content)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteContent(content.id)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    
    <CardContent className="pt-0">
      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
        {content.content}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {content.isTrainingData && (
            <Badge variant="secondary" className="text-xs">
              <GraduationCap className="h-3 w-3 mr-1" />
              Training Data
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {content.content.split(' ').length} words
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openContentDialog(content)}
        >
          View Full
        </Button>
      </div>
      
      {content.userFeedBack && (
        <div className="mt-3 p-2 bg-muted rounded text-xs">
          <strong>Feedback:</strong> {content.userFeedBack}
        </div>
      )}
    </CardContent>
  </Card>
);
```

**TRPC Integration**:
```typescript
// Server Component - History page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function HistoryPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<HistorySkeleton />}>
        <HistoryView />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - History view
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function HistoryView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedWriter, setSelectedWriter] = useState<number>();
  
  const { data: generatedContent } = useQuery(
    trpc.gw.generatedContent.get.queryOptions({ gwid: selectedWriter }),
    { enabled: !!selectedWriter }
  );
  
  // Update content mutation
  const updateContentOptions = trpc.gw.generatedContent.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.gw.generatedContent.get.queryKey({ gwid: selectedWriter })
      });
      toast.success("Content updated!");
    }
  });
  const updateContent = useMutation(updateContentOptions);
  
  // Delete content mutation
  const deleteContentOptions = trpc.gw.generatedContent.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.gw.generatedContent.get.queryKey({ gwid: selectedWriter })
      });
      toast.success("Content deleted!");
    }
  });
  const deleteContent = useMutation(deleteContentOptions);
  
  // ... component logic
}
```

### 5. Training View (`/gw/training`)

**Purpose**: Profile improvement center with AI-powered training

**Features**:
- **Training Dashboard**: Show improvement opportunities
- **Profile Selection**: Choose which profiles to train
- **Training Data Review**: See what data will be used
- **Training Progress**: Live updates during training
- **Results Preview**: Before/after comparison

**Training Interface**:
```tsx
const TrainingCenter = () => {
  const [selectedGhostwriter, setSelectedGhostwriter] = useState<number>();
  const [trainingType, setTrainingType] = useState<'psychology' | 'writing' | 'both'>('both');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Training Center</CardTitle>
          <CardDescription>
            Improve your profiles using feedback from generated content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Ghostwriter</Label>
            <Select value={selectedGhostwriter} onValueChange={setSelectedGhostwriter}>
              <SelectTrigger>
                <SelectValue placeholder="Choose ghostwriter to train" />
              </SelectTrigger>
              <SelectContent>
                {ghostwriters.map(gw => (
                  <SelectItem key={gw.id} value={gw.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback>{gw.name[0]}</AvatarFallback>
                      </Avatar>
                      {gw.name}
                      <Badge variant="outline" className="ml-auto">
                        {getTrainingDataCount(gw.id)} training samples
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Training Type</Label>
            <RadioGroup value={trainingType} onValueChange={setTrainingType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Psychology & Writing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="psychology" id="psychology" />
                <Label htmlFor="psychology">Psychology Profile Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="writing" id="writing" />
                <Label htmlFor="writing">Writing Profile Only</Label>
              </div>
            </RadioGroup>
          </div>
          
          {selectedGhostwriter && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Training Data Available:</strong>
                    <p>{getTrainingDataCount(selectedGhostwriter)} marked samples</p>
                  </div>
                  <div>
                    <strong>Last Training:</strong>
                    <p>{getLastTrainingDate(selectedGhostwriter) || 'Never'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button 
            className="w-full" 
            size="lg"
            disabled={!selectedGhostwriter || getTrainingDataCount(selectedGhostwriter) < 3}
          >
            <Brain className="h-4 w-4 mr-2" />
            Start Training
          </Button>
          
          {getTrainingDataCount(selectedGhostwriter) < 3 && (
            <p className="text-sm text-muted-foreground text-center">
              Need at least 3 training samples to start training
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Training Progress */}
      <AnimatePresence>
        {isTraining && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="h-12 w-12 mx-auto text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">Training in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzing patterns and improving profiles...
                    </p>
                  </div>
                  <Progress value={trainingProgress} className="max-w-xs mx-auto" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

**TRPC Integration**:
```typescript
// Server Component - Training page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function TrainingPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<TrainingSkeleton />}>
        <TrainingCenter />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - Training center
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function TrainingCenter() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedGhostwriter, setSelectedGhostwriter] = useState<number>();
  
  const { data: trainingData } = useQuery(
    trpc.gw.generatedContent.get.queryOptions({ gwid: selectedGhostwriter }),
    { enabled: !!selectedGhostwriter }
  );
  
  // Train psychology profile mutation
  const trainPsyProfileOptions = trpc.gw.psyProfile.train.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Psychology profile improved!");
    },
    onError: () => {
      toast.error("Training failed");
    }
  });
  const trainPsyProfile = useMutation(trainPsyProfileOptions);
  
  // Train writing profile mutation
  const trainWritingProfileOptions = trpc.gw.writingProfile.train.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Writing profile improved!");
    },
    onError: () => {
      toast.error("Training failed");
    }
  });
  const trainWritingProfile = useMutation(trainWritingProfileOptions);
  
  // ... component logic
}
```

### 6. Personas View (`/gw/personas`)

**Purpose**: Target audience management

**Features**:
- Persona cards with demographics/traits
- Create manually or extract from writers
- Link to insights generated for each persona

**TRPC Integration**:
```typescript
// Server Component - Personas page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function PersonasPage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<PersonasSkeleton />}>
        <PersonasView />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - Personas view
"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function PersonasView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Extract persona mutation
  const extractPersonaOptions = trpc.gw.persona.extract.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Persona extracted successfully!");
    }
  });
  const extractPersona = useMutation(extractPersonaOptions);
  
  // Create persona mutation
  const createPersonaOptions = trpc.gw.persona.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.listAll.queryKey() });
      toast.success("Persona created!");
    }
  });
  const createPersona = useMutation(createPersonaOptions);
  
  // ... component logic
}
```

### 4. Resources View (`/gw/resources`)

**Purpose**: Document library management

**Features**:
- Drag-and-drop upload areas (PDF/EPUB)
- Resource cards with metadata
- Preview capabilities
- Link to extracted insights

**TRPC Integration**:
```typescript
// Server Component - Resources page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function ResourcesPage() {
  await prefetch(trpc.gw.resources.list.queryOptions({ page: 1, limit: 20 }));
  
  return (
    <HydrateClient>
      <Suspense fallback={<ResourcesSkeleton />}>
        <ResourcesView />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - Resources view
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function ResourcesView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const { data: resources } = useQuery(
    trpc.gw.resources.list.queryOptions({ page: 1, limit: 20 })
  );
  
  // Upload PDF mutation
  const uploadPdfOptions = trpc.gw.resources.uploadPdf.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("PDF uploaded successfully!");
    }
  });
  const uploadPdf = useMutation(uploadPdfOptions);
  
  // Upload EPUB mutation
  const uploadEpubOptions = trpc.gw.resources.uploadEpub.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("EPUB uploaded successfully!");
    }
  });
  const uploadEpub = useMutation(uploadEpubOptions);
  
  // ... component logic
}
```

### 5. Insights View (`/gw/insights`)

**Purpose**: Knowledge base from extracted insights

**Features**:
- Filterable insights by persona/resource
- Insight cards with key points
- "Generate from Insight" actions

**TRPC Integration**:
```typescript
// Server Component - Insights page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function InsightsPage() {
  await prefetch(trpc.gw.insights.list.queryOptions({ page: 1, limit: 20 }));
  
  return (
    <HydrateClient>
      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsView />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - Insights view
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function InsightsView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedPersona, setSelectedPersona] = useState<number>();
  const [selectedResource, setSelectedResource] = useState<number>();
  
  const { data: insights } = useQuery(
    trpc.gw.insights.list.queryOptions({ page: 1, limit: 20 })
  );
  
  // Extract insights mutation
  const extractInsightsOptions = trpc.gw.insights.extract.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.insights.list.queryKey() });
      toast.success("Insights extracted successfully!");
    },
    onError: () => {
      toast.error("Failed to extract insights");
    }
  });
  const extractInsights = useMutation(extractInsightsOptions);
  
  const handleExtract = async () => {
    if (selectedPersona && selectedResource) {
      await extractInsights.mutateAsync({
        personaId: selectedPersona.toString(),
        resourceId: selectedResource.toString()
      });
    }
  };
  
  // ... component logic
}
```

### 6. Generate View (`/gw/generate`)

**Purpose**: Main content generation workspace with two powerful modes

**Layout**: Split view with mode switcher

```
┌─────────────────┬───────────────────────────────┐
│  Configuration  │        Generated Content      │
│   (Card)        │         (Card)                │
│                 │                               │
│ [Tabs: Writer Mode | Custom Mode]               │
│                 │                               │
│ == Writer Mode ==                               │
│ • Select Writer │  ┌─ Textarea (editable) ─────┐ │
│ • Select Persona│  │                           │ │
│                 │  │  Generated text appears   │ │
│ == Custom Mode ==│  │  here and can be edited   │ │
│ • Psy Profile   │  │  before saving            │ │
│ • Writing Style │  └───────────────────────────┘ │
│ • Persona       │                               │
│                 │  ┌─ Toolbar ─────────────────┐ │
│ [Instructions]? │  │ [DropdownMenu Export]     │ │
│ [Textarea]      │  │ [Button Save] [Toast]     │ │
│                 │  └───────────────────────────┘ │
│ [+ Add Insight] │                               │
│ [Selected: 2]   │                               │
│                 │                               │
│ [Button Primary]│                               │
│   Generate      │                               │
└─────────────────┴───────────────────────────────┘
```

**Mode Switching Design**:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

const GenerationConfig = () => {
  const [mode, setMode] = useState<"writer" | "custom">("writer");
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  
  return (
    <Card>
      <CardHeader>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="writer">
              <User className="h-4 w-4 mr-2" />
              Writer Mode
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Sliders className="h-4 w-4 mr-2" />
              Custom Mode
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <TabsContent value="writer" className="space-y-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a ghostwriter" />
            </SelectTrigger>
            <SelectContent>
              {writers.map(writer => (
                <SelectItem key={writer.id} value={writer.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{writer.name[0]}</AvatarFallback>
                    </Avatar>
                    {writer.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select target persona (optional)" />
            </SelectTrigger>
            {/* Persona options */}
          </Select>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select psychology profile" />
            </SelectTrigger>
            {/* Psy profile options */}
          </Select>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select writing style" />
            </SelectTrigger>
            {/* Writing style options */}
          </Select>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select target persona (optional)" />
            </SelectTrigger>
            {/* Persona options */}
          </Select>
        </TabsContent>
        
        {/* Shared Instructions Field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Provide any instructions for your content:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
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
            className="min-h-[100px]"
          />
        </div>
        
        {/* Insight Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Insights (optional)</Label>
            <Badge variant="secondary">
              {selectedInsights.length} selected
            </Badge>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setInsightDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add insights to include
          </Button>
          
          {/* Selected insights preview */}
          {selectedInsights.length > 0 && (
            <div className="space-y-1">
              {selectedInsights.map(id => (
                <div key={id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                  <Lightbulb className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate flex-1">{getInsightTitle(id)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeInsight(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button className="w-full" size="lg">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content
        </Button>
      </CardContent>
    </Card>
  );
};
```

**Key Improvements**:
1. **Two Modes**: 
   - **Writer Mode**: Quick generation using existing ghostwriters
   - **Custom Mode**: Mix and match any psychology profile with any writing style

2. **Instructions Field**: 
   - Renamed from "topic" for clarity
   - Helpful tooltip with examples
   - Supports everything from topics to full drafts

3. **Insights Integration**:
   - Can be combined with instructions
   - Visual selection with preview
   - Clear count of selected insights

**TRPC Integration**:
```typescript
// Server Component - Generate page
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function GeneratePage() {
  await prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <HydrateClient>
      <Suspense fallback={<GenerateSkeleton />}>
        <GenerationWorkspace />
      </Suspense>
    </HydrateClient>
  );
}

// Client Component - Generation workspace
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function GenerationWorkspace() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"writer" | "custom">("writer");
  const [generatedContent, setGeneratedContent] = useState("");
  
  const { data: overview } = useQuery(trpc.gw.listAll.queryOptions());
  
  // Generate content mutation
  const generateContentOptions = trpc.gw.content.generate.mutationOptions({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast.success("Content generated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to generate content");
    }
  });
  const generateContent = useMutation(generateContentOptions);
  
  // Save content mutation
  const saveContentOptions = trpc.gw.content.save.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.generatedContent.get.queryKey() });
      toast.success("Content saved!");
    },
    onError: () => {
      toast.error("Failed to save content");
    }
  });
  const saveContent = useMutation(saveContentOptions);
  
  // Generation payload differs by mode
  const handleGenerate = async () => {
    const payload = mode === 'writer' 
      ? { gwId: selectedWriter, personaProfileId: selectedPersona }
      : { 
          psychologyProfileId: selectedPsyProfile,
          writingProfileId: selectedWritingProfile,
          personaProfileId: selectedPersona
        };
    
    await generateContent.mutateAsync({
      ...payload,
      topic: instructions, // API still expects "topic"
      insightId: selectedInsights.length > 0 ? selectedInsights[0] : undefined
    });
  };
  
  // ... component logic
}
```

## Component Architecture (shadcn/ui-powered)

### Core shadcn/ui Components Usage

We'll maximize use of shadcn/ui components for consistency and rapid development:

1. **Layout Components**
   - `Sidebar` - Main navigation (from shadcn/ui)
   - `Sheet` - Mobile navigation drawer
   - `Separator` - Visual dividers
   - `ScrollArea` - Scrollable content areas

2. **Data Display**
   - `Card` - All content cards (writers, personas, etc.)
   - `Table` - Resource and insight lists
   - `Badge` - Status indicators
   - `Avatar` - User/writer representations
   - `Tooltip` - Contextual information

3. **Forms & Inputs**
   - `Form` + `react-hook-form` - All forms
   - `Input` - Text inputs
   - `Textarea` - Content editing (especially generated content)
   - `Select` - Dropdown selections
   - `Switch` - Toggle settings
   - `RadioGroup` - Multiple choice options
   - `Checkbox` - Multi-select options

4. **Feedback & Actions**
   - `Dialog` - Modal interactions
   - `AlertDialog` - Confirmations (delete actions)
   - `Toast` - Notifications
   - `Button` - All actions
   - `DropdownMenu` - Context menus
   - `Command` - Search and command palette

5. **Content Presentation**
   - `Tabs` - Profile views (psychology/writing)
   - `Accordion` - Collapsible sections
   - `HoverCard` - Preview on hover
   - `Popover` - Inline editing
   - `Progress` - Upload/generation progress

### Page-Level Components

1. **Layout Component** (`layout.tsx`)
   ```tsx
   - shadcn/ui Sidebar for navigation
   - Breadcrumb navigation
   - Command palette for quick actions
   ```

2. **Dashboard Page** (`page.tsx`)
   ```tsx
   - Card grid for overview
   - Button components for CTAs
   - Badge for status indicators
   ```

3. **Resource-Specific Pages**
   - Writer list/detail pages with Cards
   - Persona management with DataTables
   - Generation workspace with split layout

### Custom Components (Built on shadcn/ui)

1. **Cards**
   - `GhostwriterCard` - Card + Badge + Button + DropdownMenu
   - `PersonaCard` - Card + Avatar + Badge
   - `ResourceCard` - Card + Progress + Button
   - `InsightCard` - Card + Accordion + Button
   - `GenerationCard` - Card + Textarea + Toolbar

2. **Forms**
   - `WriterCreationForm` - Multi-step with Tabs
   - `PersonaForm` - Form with Select components
   - `GenerationForm` - Form with RadioGroup + Select
   - `FeedbackForm` - Dialog + RadioGroup + Textarea

3. **Specialized Components**
   - `FileUpload` - Custom drag-drop + Progress
   - `ContentEditor` - Textarea with toolbar for export
   - `ProfileSummary` - Tabs for psychology/writing
   - `TrainingControls` - Switch + Button group

### Content Editor with Export

The generated content display will use an enhanced Textarea component:

```tsx
export function ContentEditor({ content, onSave }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Generated Content</Label>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportAs('.txt')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as .txt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs('.md')}>
                <FileCode className="h-4 w-4 mr-2" />
                Export as .md
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard()}>
                <Copy className="h-4 w-4 mr-2" />
                Copy to clipboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[400px] font-mono"
        placeholder="Generated content will appear here..."
      />
    </div>
  );
}
```

## Data Fetching Patterns

### Server Components (SEO + Performance)
```typescript
// Layout - prefetch shared data
export default async function GWLayout({ children }: Props) {
  prefetch(trpc.gw.listAll.queryOptions());
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <HydrateClient>
        <Suspense fallback={<PageSkeleton />}>
          {children}
        </Suspense>
      </HydrateClient>
    </div>
  );
}

// Individual pages - prefetch specific data
export default async function WritersPage() {
  prefetch(trpc.gw.listAll.queryOptions());
  
  return <WritersList />;
}
```

### Client Components (Interactivity)
```typescript
export function GenerationWorkspace() {
  const trpc = useTRPC();
  const { data: overview } = useQuery(trpc.gw.listAll.queryOptions());
  const generateContent = useMutation(trpc.gw.content.generate);
  
  // Component logic...
}
```

## Delightful UX Patterns & Micro-Interactions

### 1. Onboarding Magic ✨
```tsx
import { motion } from "motion/react";

// First-time user experience
const OnboardingFlow = () => (
  <div className="space-y-8 max-w-2xl mx-auto">
    {/* Animated welcome with theme colors */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Transform your writing into AI
      </h1>
    </motion.div>
    
    {/* Drag-and-drop with beautiful hover states */}
    <FileUploadZone className="border-2 border-dashed border-border rounded-xl p-8 hover:border-primary hover:bg-primary/5 transition-all duration-300" />
  </div>
);
```

### 2. Smart Content Generation 🚀
```tsx
import { motion, AnimatePresence } from "motion/react";

// Generation button with satisfying interactions
<Button 
  onClick={handleGenerate}
  className="relative overflow-hidden group"
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
        <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
        Generate Content
      </motion.div>
    )}
  </AnimatePresence>
</Button>
```

### 3. Content Editor Delights 📝
```tsx
// Textarea with auto-resize and smooth typing indicators
<div className="relative">
  <Textarea
    value={content}
    onChange={handleChange}
    className="min-h-[400px] resize-none border-0 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
    placeholder="Your generated content will appear here like magic..."
  />
  
  {/* Live word count with animations */}
  <motion.div 
    className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white/80 backdrop-blur px-2 py-1 rounded"
    key={wordCount}
    initial={{ scale: 1.1 }}
    animate={{ scale: 1 }}
  >
    {wordCount} words
  </motion.div>
  
  {/* Auto-save indicator */}
  <AnimatePresence>
    {isAutoSaving && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-4 right-4 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full"
      >
        <Check className="h-3 w-3" />
        Saved
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### 4. Cards with Personality 🎨
```tsx
// Ghostwriter cards with hover animations and status indicators
<Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50">
  <CardContent className="p-6">
    {/* Avatar with status indicator */}
    <div className="relative mb-4">
      <Avatar className="h-12 w-12 ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
        <AvatarImage src={writer.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
          {writer.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      {/* Active status pulse */}
      <motion.div 
        className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
    
    {/* Content with subtle animations */}
    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
      {writer.name}
    </h3>
    <p className="text-sm text-gray-600 mt-1">
      {writer.generationCount} generations • Last used {writer.lastUsed}
    </p>
    
    {/* Quick actions on hover */}
    <motion.div 
      className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
      initial={false}
    >
      <Button size="sm" variant="outline">Quick Generate</Button>
      <Button size="sm" variant="ghost">
        <Settings className="h-3 w-3" />
      </Button>
    </motion.div>
  </CardContent>
</Card>
```

### 5. Delightful Loading States 🎭
```tsx
// Content generation with beautiful progress
<div className="space-y-4">
  <Progress value={progress} className="h-2" />
  
  <motion.div 
    className="text-center space-y-2"
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <Brain className="h-8 w-8 mx-auto text-blue-500" />
    <p className="text-sm text-gray-600">
      {generationSteps[currentStep]}
    </p>
  </motion.div>
  
  {/* Animated dots */}
  <div className="flex justify-center gap-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-2 w-2 bg-blue-400 rounded-full"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ 
          duration: 0.6, 
          repeat: Infinity, 
          delay: i * 0.2 
        }}
      />
    ))}
  </div>
</div>
```

## User Experience Optimizations

### 1. Lightning-Fast Performance ⚡
- Server-rendered content for instant loading
- Optimistic updates for immediate feedback
- Skeleton loaders that match final content
- Prefetch next likely actions

### 2. Intelligent Defaults 🧠
- Auto-select most recent writer
- Remember user preferences
- Smart suggestions based on context
- Contextual quick actions

### 3. Satisfying Interactions 🎯
- Haptic-style button feedback
- Smooth page transitions
- Contextual hover states
- Success celebrations with confetti

### 4. Real-Time Feedback 📡
- Live typing indicators
- Auto-save with visual confirmation
- Progress bars for long operations
- Instant validation messages

### 5. Keyboard Mastery ⌨️
- Cmd+Enter for generate
- Cmd+S for save
- Tab navigation flow
- Quick switcher (Cmd+K)

## Mobile Responsiveness

### Breakpoint Strategy
- **Desktop** (1024px+): Full sidebar + content
- **Tablet** (768px-1023px): Collapsible sidebar
- **Mobile** (< 768px): Bottom tab navigation

### Mobile-First Components
- Touch-friendly buttons (44px min)
- Swipeable cards for content
- Bottom sheet for forms
- Simplified generation flow

## Performance Considerations

### Data Loading
- Pagination for large lists (20 items default)
- Infinite scroll for insights/resources
- Debounced search inputs
- Cached TRPC queries

### Bundle Optimization
- Route-based code splitting
- Lazy loading for non-critical components
- Optimized Tailwind purging
- Image optimization for previews

## Accessibility Features

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex interactions
- Skip navigation links
- Focus management

### Keyboard Navigation
- Tab order follows logical flow
- Escape key closes modals/forms
- Arrow keys for list navigation
- Enter/Space for actions

### Visual Accessibility
- High contrast mode support
- Focus indicators
- Color is not sole indicator
- Scalable text support

## Error Handling & Edge Cases

### API Error States
- Network failures with retry options
- Permission errors with clear messaging
- Validation errors with field-specific feedback
- Server errors with fallback actions

### Empty States
- No ghostwriters: Prominent creation CTA
- No resources: Upload guidance
- No insights: Extraction instructions
- No generations: Tutorial flow

### Loading States
- Skeleton components for consistent layout
- Progress indicators for long operations
- Optimistic UI for common actions
- Graceful degradation for failures

## Implementation Priority

### Phase 1: Core Generation (Week 1)
1. **Essential Infrastructure**:
   - Basic layout with sidebar navigation
   - Dashboard with overview data
   - TRPC integration setup

2. **Generation Workspace**:
   - Writer/Custom mode switcher
   - Instructions field with tooltip
   - Basic content generation
   - Content editor with export

3. **Ghostwriter Management**:
   - Creation flow with content upload
   - Basic writer listing

### Phase 2: Content & Profile Management (Week 2)
1. **History Management**:
   - Generated content listing
   - Training data marking
   - Content filtering and search
   - Export functionality

2. **Profile Management**:
   - Psychology & Writing profiles tabs
   - Custom profile creation
   - Profile modification interface

3. **Enhanced Generation**:
   - Insight selection in generation
   - Custom mode with profile mixing

### Phase 3: Training & Optimization (Week 3)
1. **Training Center**:
   - Training interface design
   - Progress tracking
   - Training data review
   - Profile improvement workflow

2. **Advanced Features**:
   - Persona creation and extraction
   - Resource upload and management
   - Insight extraction workflow

### Phase 4: Polish & Enhancement (Week 4)
1. **User Experience**:
   - Mobile responsiveness
   - Accessibility improvements
   - Advanced search/filtering
   - Performance optimizations

2. **Final Features**:
   - Batch operations
   - Advanced training options
   - User onboarding flow
   - Analytics and insights

## Dependencies for AMAZING UX

### Required shadcn/ui Components

**Already Installed** ✅:
- `button`, `card`, `form`, `input`, `label`, `textarea` 
- `calendar`, `popover`, `separator`, `sheet`, `sidebar`
- `skeleton`, `tooltip`, `dialog`

**Need to Install** 📦:
```bash
# Navigation and layout
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add breadcrumb
npx shadcn-ui@latest add command

# Data display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar

# Forms and inputs
npx shadcn-ui@latest add select
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add checkbox

# Feedback and actions
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sonner  # Enhanced notifications

# Content presentation
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add hover-card
npx shadcn-ui@latest add progress

# Additional utilities
npx shadcn-ui@latest add collapsible
```

### Minimal Dependencies for Performance

```bash
# Modern motion (lighter, more performant)
npm install motion

# Essential interactions only
npm install react-hotkeys-hook

# File export functionality
npm install file-saver  # 3kb gzipped

# That's it! Keep it fast and responsive.
```

### Visual Excellence Without Excess

#### Smart Use of Theme Colors 🎨
```tsx
// Use existing theme variables, no hardcoded colors
const SuccessAnimation = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="inline-flex items-center gap-2 text-green-600 dark:text-green-400"
  >
    <CheckCircle2 className="h-5 w-5" />
    <span className="text-sm font-medium">Saved successfully</span>
  </motion.div>
);

// Subtle gradient only where it adds value
const HeroTitle = () => (
  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
    Transform your writing into AI
  </h1>
);
```

#### Tasteful Success Feedback 🎯
```tsx
// Instead of confetti, use subtle but satisfying animations
const GenerationComplete = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed bottom-8 right-8 p-4 bg-background border rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <p className="font-medium">Content generated!</p>
              <p className="text-sm text-muted-foreground">2,456 words created</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

#### Performance-First Animations 🚀
```tsx
// Use CSS transforms for 60fps animations
const CardInteraction = () => (
  <Card 
    className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
    style={{ willChange: 'transform' }}
  >
    {/* Content */}
  </Card>
);

// Loading states that feel instant
const QuickSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);
```

#### Subtle Micro-Interactions ✨
```css
/* Focus states that feel premium */
.focus-premium {
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary;
}

/* Smooth hover states */
.hover-smooth {
  @apply transition-all duration-200 ease-out;
  @apply hover:bg-muted/50;
}

/* Active states that feel responsive */
.active-press {
  @apply transition-transform duration-75;
  @apply active:scale-[0.98];
}

/* Natural easing for all animations */
.ease-natural {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### TRPC Integration Patterns

1. **Server Components (Prefetching)**:
```tsx
// In page.tsx
import { prefetch, trpc } from "@/trpc/server";

export default async function Page() {
  // Prefetch data for hydration
  prefetch(trpc.gw.listAll.queryOptions());
  
  return <ClientComponent />;
}
```

2. **Client Components (Queries)**:
```tsx
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

function Component() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.gw.listAll.queryOptions());
  // Use the data
}
```

3. **Client Components (Mutations) - PROPER PATTERN FOR v11**:
```tsx
"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function Component() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Create mutation options with callbacks
  const mutationOptions = trpc.gw.content.generate.mutationOptions({
    onSuccess: (data) => {
      // Handle success
      toast.success("Content generated!");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: trpc.gw.listAll.queryKey() 
      });
    },
    onError: (error) => {
      // Handle error
      toast.error("Failed to generate content");
    },
  });
  
  // Create the mutation
  const mutation = useMutation(mutationOptions);
  
  const handleSubmit = async () => {
    await mutation.mutateAsync({ /* data */ });
  };
}
```

4. **Long-Running Operations (with timeout handling)**:
```tsx
"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function Component() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const mutationOptions = trpc.gw.ghostwriter.create.mutationOptions({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: trpc.gw.listAll.queryKey() 
      });
      toast.success("Ghostwriter created!");
      router.push("/gw/writers");
    },
    onError: (error) => {
      toast.error("Failed to create ghostwriter");
    },
  });
  
  const mutation = useMutation(mutationOptions);
  
  const handleCreate = async () => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      // Handle timeout specifically
      if (error instanceof Error && error.name === 'AbortError') {
        toast.warning("Operation is taking longer than expected. Check back later.");
      }
    }
  };
}
```

## Technical Implementation Notes

### File Structure
```
/gw/
├── layout.tsx                 # Main layout with sidebar
├── page.tsx                   # Dashboard
├── loading.tsx                # Global loading UI
├── error.tsx                  # Error boundary
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── forms/                 # Form components
│   ├── cards/                 # Card components
│   └── layout/                # Layout-specific components
├── generate/
│   └── page.tsx               # Generation workspace
├── writers/
│   ├── page.tsx               # Writers list
│   ├── new/page.tsx          # Creation wizard
│   └── [id]/
│       ├── page.tsx           # Writer detail
│       └── edit/page.tsx      # Edit profiles
├── profiles/
│   ├── page.tsx               # Psychology & Writing profiles
│   ├── psychology/
│   │   └── new/page.tsx      # Custom psychology profile
│   └── writing/
│       └── new/page.tsx      # Custom writing profile
├── history/
│   ├── page.tsx               # Generated content history
│   └── [id]/page.tsx         # Content detail view
├── training/
│   └── page.tsx               # Training center
├── personas/
│   ├── page.tsx               # Personas list
│   └── [id]/page.tsx         # Persona detail
├── resources/
│   ├── page.tsx               # Resources list
│   └── [id]/page.tsx         # Resource detail
└── insights/
    ├── page.tsx               # Insights list
    └── [id]/page.tsx         # Insight detail
```

### State Management
- TRPC for server state
- React Hook Form for form state
- Local state for UI interactions
- URL state for filters/pagination

### Styling Approach
- Tailwind utility classes
- Component-scoped custom styles
- CSS variables for theming
- Mobile-first responsive design

This interface design prioritizes user efficiency and provides a smooth pathway from initial ghostwriter creation to sophisticated content generation workflows. The modular component architecture ensures maintainability while the TRPC integration provides type safety and excellent developer experience.