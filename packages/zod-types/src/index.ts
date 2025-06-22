import { z } from 'zod';

// =====================================================
// API RESPONSE SCHEMAS
// =====================================================

// Base response type that matches API
export const ApiResponse = <T>(dataSchema: z.ZodType<T>) => z.union([
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    meta: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
      hasMore: z.boolean().optional(),
    }).optional(),
  }),
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.string().optional(),
    }),
  }),
]);

// Type helpers for API responses
export type ApiResponseSuccessType<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export type ApiResponseErrorType = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export type ApiResponseType<T> = ApiResponseSuccessType<T> | ApiResponseErrorType;

// =====================================================
// CORE ENTITY SCHEMAS
// =====================================================

export const GhostwriterSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.number(),
  psyProfileId: z.number().nullable(),
  writingProfileId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PsyProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  userId: z.number(),
  ghostwriterId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WritingProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  userId: z.number(),
  ghostwriterId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PersonaSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  content: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OriginalContentSchema = z.object({
  id: z.number(),
  content: z.string(),
  ghostwriterId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GeneratedContentSchema = z.object({
  id: z.number(),
  content: z.string(),
  prompt: z.string(),
  userId: z.number(),
  ghostwriterId: z.number().nullable(),
  writingProfileId: z.number(),
  psyProfileId: z.number(),
  personaId: z.number().nullable(),
  userFeedBack: z.string().nullable(),
  isTrainingData: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ResourceContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InsightSchema = z.object({
  id: z.number(),
  title: z.string(),
  keyPoints: z.string(),
  rawContent: z.string(),
  userId: z.number(),
  personaId: z.number(),
  resourceContentId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// =====================================================
// INPUT SCHEMAS - FRONTEND/TRPC
// =====================================================

export const CreateGhostwriterInput = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required").describe("Content samples separated by '==='"),
  description: z.string().optional(),
});

export const CreatePsyProfileInput = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  gwId: z.string().optional(),
});

export const GenerateContentInput = z.object({
  psychologyProfileId: z.string().min(1, "Psychology profile ID is required"),
  writingProfileId: z.string().min(1, "Writing profile ID is required"),
  personaProfileId: z.string().optional(),
  gwId: z.string().optional(),
  topic: z.string().optional(),
  insightId: z.string().optional(),
}).refine(data => data.topic || data.insightId, {
  message: "Either topic or insightId is required",
});

export const SaveContentInput = z.object({
  content: z.string().min(1, "Content is required"),
  gwId: z.string().optional(),
  psyProfileId: z.string().min(1, "Psychology profile ID is required"),
  writingProfileId: z.string().min(1, "Writing profile ID is required"),
  personaProfileId: z.string().optional(),
  prompt: z.string().min(1, "Prompt is required"),
  userFeedback: z.string().optional(),
  isTrainingData: z.boolean().optional(),
});

export const CreatePersonaInput = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

export const ValueExtractorInput = z.object({
  personaId: z.string().min(1, "Persona ID is required"),
  resourceId: z.string().min(1, "Resource ID is required"),
  topic: z.string().optional(),
});

export const UpdateGeneratedContentInput = z.object({
  userFeedBack: z.string().optional(),
  isTrainingData: z.boolean().optional(),
});

export const PaginationInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// =====================================================
// INPUT SCHEMAS - API/BACKEND
// =====================================================

export const ProfilerSchema = z.object({
  content: z.string().min(1),
  gwId: z.string().optional(),
  isSingleString: z.string().optional(),
});

export const originalContentAddSchema = z.object({
  content: z.string().min(1),
});

export const PsyProfileCreateSchema = z.object({
  content: z.string().min(1),
  name: z.string().min(1),
  gwId: z.string().optional(),
});

export const WriteSchema = z.object({
  psychologyProfileId: z.string().min(1),
  writingProfileId: z.string().min(1),
  personaProfileId: z.string().min(1).optional(),
  gwId: z.string().optional(),
  insightId: z.string().min(1).optional(),
  topic: z.string().min(1).optional(),
  userFeedback: z.string().optional(),
});

export const PersonaCreateSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  name: z.string().min(1),
});

export const GhostWriterIdSchema = z.object({
  gwId: z.string().optional(),
});

export const SaveContentSchema = z.object({
  content: z.string().min(1),
  gwId: z.string().optional(),
  psyProfileId: z.string().min(1),
  writingProfileId: z.string().min(1),
  personaProfileId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  userFeedback: z.string().optional(),
  isTrainingData: z.string().optional(),
});

export const ValueExtractorSchema = z.object({
  personaId: z.string().min(1),
  resourceId: z.string().min(1),
});

export const CreateGhostwriterSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateGhostwriterSchema = z.object({
  name: z.string().min(1).optional(),
});

export const UpdatePsyProfileSchema = z.object({
  content: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

export const UpdateWritingProfileSchema = z.object({
  content: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

export const UpdatePersonaSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
});

export const UpdateGeneratedContentSchema = z.object({
  userFeedBack: z.string().optional(),
  isTrainingData: z.boolean().optional(),
});

// Profile customization schemas
export const CustomizeProfileInput = z.object({
  modifications: z.string().min(1, "Modifications are required").describe("Instructions for how to modify the profile"),
});

export const CustomizeProfileSchema = z.object({
  modifications: z.string().min(1),
});

// File conversion schemas
export const PdfToTxtSchema = z.object({
  pdfFile: z.custom<File | Blob | ArrayBuffer>(
    (val) => val instanceof File || val instanceof Blob || val instanceof ArrayBuffer,
    { message: "Must be a File, Blob, or ArrayBuffer" }
  ),
  title: z.string(),
  maxPages: z.number().int().positive().optional(),
  encoding: z.enum(["utf-8", "utf-16", "ascii"]).optional().default("utf-8"),
});

export const EpubToTxtSchema = z.object({
  epubFile: z.custom<File | Blob | ArrayBuffer>(
    (val) => val instanceof File || val instanceof Blob || val instanceof ArrayBuffer,
    { message: "Must be a File, Blob, or ArrayBuffer" }
  ),
  title: z.string(),
  includeMetadata: z.boolean().optional().default(false),
  chapterSeparator: z.string().optional().default("\n\n===\n\n"),
});

export const TextToResourceSchema = z.object({
  content: z.string().min(1, "Content is required"),
  title: z.string().min(1, "Title is required"),
});

// =====================================================
// PARTIAL SCHEMAS FOR LIST VIEWS
// =====================================================

export const GhostwriterListSchema = GhostwriterSchema.pick({
  id: true,
  name: true,
  psyProfileId: true,
  writingProfileId: true,
});


export const PsyProfileListSchema = PsyProfileSchema.pick({
  id: true,
  name: true,
});

export const WritingProfileListSchema = WritingProfileSchema.pick({
  id: true,
  name: true,
});

export const PersonaListSchema = PersonaSchema.pick({
  id: true,
  name: true,
  description: true,
});

export const ResourceContentListSchema = ResourceContentSchema.pick({
  id: true,
  title: true,
  userId: true,
  createdAt: true,
}).extend({
  insightCount: z.number(),
});

// ListAll response schema
export const ListAllResponseSchema = z.array(z.object({
  ghostwriters: z.array(GhostwriterListSchema),
  psyProfiles: z.array(PsyProfileListSchema),
  writingProfiles: z.array(WritingProfileListSchema),
  personas: z.array(PersonaListSchema),
  resourceContents: z.array(ResourceContentListSchema),
}));

// Insight with relations for list views
export const InsightWithRelationsSchema = InsightSchema.extend({
  persona: z.object({ id: z.number(), name: z.string() }).optional(),
  resourceContent: z.object({ id: z.number(), title: z.string() }).optional(),
});

// Generated content with relations for list views
export const GeneratedContentWithRelationsSchema = GeneratedContentSchema.extend({
  writingProfile: z.object({ id: z.number(), name: z.string() }).optional(),
  psyProfile: z.object({ id: z.number(), name: z.string() }).optional(),
  persona: z.object({ id: z.number(), name: z.string() }).optional(),
  ghostwriter: z.object({ id: z.number(), name: z.string() }).optional(),
});

// Paginated response schema
export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: z.array(dataSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasMore: z.boolean(),
  }).optional(),
});

// Generate content response schema
export const GenerateContentResponseSchema = z.object({
  content: z.string(),
  writingProfileId: z.string(),
  psychologyProfileId: z.string(),
  topic: z.string().optional(),
  gwId: z.string().optional(),
  personaProfileId: z.string().optional(),
});

// Create ghostwriter response schema
export const CreateGhostwriterResponseSchema = z.object({
  ghostwriter: GhostwriterSchema,
  originalContents: z.array(OriginalContentSchema),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

// Entity types
export type Ghostwriter = z.infer<typeof GhostwriterSchema>;
export type PsyProfile = z.infer<typeof PsyProfileSchema>;
export type WritingProfile = z.infer<typeof WritingProfileSchema>;
export type Persona = z.infer<typeof PersonaSchema>;
export type OriginalContent = z.infer<typeof OriginalContentSchema>;
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;
export type ResourceContent = z.infer<typeof ResourceContentSchema>;
export type Insight = z.infer<typeof InsightSchema>;

// List types
export type GhostwriterList = z.infer<typeof GhostwriterListSchema>;
export type PsyProfileList = z.infer<typeof PsyProfileListSchema>;
export type WritingProfileList = z.infer<typeof WritingProfileListSchema>;
export type PersonaList = z.infer<typeof PersonaListSchema>;
export type ResourceContentList = z.infer<typeof ResourceContentListSchema>;
export type ListAllResponse = z.infer<typeof ListAllResponseSchema>;
export type InsightWithRelations = z.infer<typeof InsightWithRelationsSchema>;
export type GeneratedContentWithRelations = z.infer<typeof GeneratedContentWithRelationsSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

// Input types
export type CreateGhostwriterData = z.infer<typeof CreateGhostwriterInput>;
export type GenerateContentData = z.infer<typeof GenerateContentInput>;
export type SaveContentData = z.infer<typeof SaveContentInput>;
export type CreatePersonaData = z.infer<typeof CreatePersonaInput>;
export type UpdateGeneratedContentData = z.infer<typeof UpdateGeneratedContentInput>;
export type CustomizeProfileData = z.infer<typeof CustomizeProfileInput>;

// Response types
export type GenerateContentResponse = z.infer<typeof GenerateContentResponseSchema>;
export type CreateGhostwriterResponse = z.infer<typeof CreateGhostwriterResponseSchema>;