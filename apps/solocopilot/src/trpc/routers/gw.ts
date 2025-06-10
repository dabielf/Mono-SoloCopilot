/**
 * Ghostwriter API TRPC Router
 * 
 * This router provides type-safe access to the Ghostwriter API with excellent DX.
 * All procedures include proper validation, error handling, and TypeScript support.
 * 
 * Example usage:
 * ```typescript
 * // Create a ghostwriter
 * const result = await trpc.gw.ghostwriter.create.mutate({
 *   name: "John Doe",
 *   content: "Sample text 1===Sample text 2===Sample text 3"
 * });
 * 
 * // Generate content
 * const content = await trpc.gw.content.generate.mutate({
 *   psychologyProfileId: "123",
 *   writingProfileId: "456",
 *   topic: "Write about AI in 2024"
 * });
 * 
 * // List all user data
 * const data = await trpc.gw.listAll.query();
 * ```
 */

import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { createApiServerForTRPC } from '@/modules/api/ky';
import { TRPCError } from '@trpc/server';

// =====================================================
// SCHEMAS & TYPES
// =====================================================

// Base response type that matches API
const ApiResponse = <T>(dataSchema: z.ZodType<T>) => z.union([
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

// Core entity schemas
const GhostwriterSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.number(),
  psyProfileId: z.number().nullable(),
  writingProfileId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PsyProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  userId: z.number(),
  ghostwriterId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const WritingProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  userId: z.number(),
  ghostwriterId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PersonaSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  content: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const OriginalContentSchema = z.object({
  id: z.number(),
  content: z.string(),
  ghostwriterId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const GeneratedContentSchema = z.object({
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

const ResourceContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const InsightSchema = z.object({
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

// Input schemas
const CreateGhostwriterInput = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required").describe("Content samples separated by '==='"),
});

const CreatePsyProfileInput = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  gwId: z.string().optional(),
});

const GenerateContentInput = z.object({
  psychologyProfileId: z.string().min(1, "Psychology profile ID is required"),
  writingProfileId: z.string().min(1, "Writing profile ID is required"),
  personaProfileId: z.string().optional(),
  gwId: z.string().optional(),
  topic: z.string().optional(),
  insightId: z.string().optional(),
}).refine(data => data.topic || data.insightId, {
  message: "Either topic or insightId is required",
});

const SaveContentInput = z.object({
  content: z.string().min(1, "Content is required"),
  gwId: z.string().optional(),
  psyProfileId: z.string().min(1, "Psychology profile ID is required"),
  writingProfileId: z.string().min(1, "Writing profile ID is required"),
  personaProfileId: z.string().optional(),
  prompt: z.string().min(1, "Prompt is required"),
  userFeedback: z.string().optional(),
  isTrainingData: z.boolean().optional(),
});

const CreatePersonaInput = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

const ValueExtractorInput = z.object({
  personaId: z.string().min(1, "Persona ID is required"),
  resourceId: z.string().min(1, "Resource ID is required"),
});

const UpdateGeneratedContentInput = z.object({
  userFeedBack: z.string().optional(),
  isTrainingData: z.boolean().optional(),
});

const PaginationInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Create FormData from object for multipart/form-data requests
 */
function createFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
}

type ApiResponseSuccessType<T> = {
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

type ApiResponseErrorType = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

// Type for API responses
type ApiResponseType<T> = ApiResponseSuccessType<T> | ApiResponseErrorType;


/**
 * Handle API responses and throw TRPC errors for failures
 */
async function handleApiResponse<T>(response: Response, schema?: z.ZodType<ApiResponseType<T>>): Promise<T> {
  const data = await response.json() as unknown;
  
  if (response.status !== 200) {
    const errorData = data as { error?: { message?: string } };
    if (errorData.error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: errorData.error.message || 'API request failed',
        cause: errorData.error,
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'API request failed',
    });
  }
  
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid response format from API',
        cause: result.error,
      });
    }
    
    if (!result.data.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.data.error.message,
        cause: result.data.error,
      });
    }
    
    return result.data.data;
  }

  if ((data as ApiResponseType<T>).success) {
    return (data as ApiResponseSuccessType<T>).data;
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Invalid response format from API',
    cause: data,
  });
}

// =====================================================
// MAIN ROUTER
// =====================================================

export const gwRouter = createTRPCRouter({

  // =====================================================
  // CORE DATA
  // =====================================================
  
  /**
   * Get all user data (ghostwriters, profiles, personas, resources)
   */
  listAll: baseProcedure
    .query(async () => {
      const apiClient = createApiServerForTRPC();
      const response = await apiClient.get('gw');
      return handleApiResponse(response, ApiResponse(z.array(z.object({
        ghostwriters: z.array(GhostwriterSchema.pick({ id: true, name: true, psyProfileId: true, writingProfileId: true })),
        psyProfiles: z.array(PsyProfileSchema.pick({ id: true, name: true })),
        writingProfiles: z.array(WritingProfileSchema.pick({ id: true, name: true })),
        personas: z.array(PersonaSchema.pick({ id: true, name: true, description: true })),
        resourceContents: z.array(ResourceContentSchema.pick({ id: true, title: true })),
      }))));
    }),

  // =====================================================
  // GHOSTWRITER MANAGEMENT
  // =====================================================
  
  ghostwriter: createTRPCRouter({
    /**
     * Create a new ghostwriter with automatic profile generation
     */
    create: baseProcedure
      .input(CreateGhostwriterInput)
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw', { body: formData });
        return handleApiResponse(response, ApiResponse(z.object({
          ghostwriter: GhostwriterSchema,
          psyProfile: PsyProfileSchema,
          writingProfile: WritingProfileSchema,
          originalContents: z.array(OriginalContentSchema),
        })));
      }),

    /**
     * Get a specific ghostwriter by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/ghostwriter/${input.id}`);
        return handleApiResponse(response, ApiResponse(GhostwriterSchema.extend({
          originalContents: z.array(OriginalContentSchema),
        })));
      }),

    /**
     * Update ghostwriter name
     */
    update: baseProcedure
      .input(z.object({ 
        id: z.number(), 
        name: z.string().min(1, "Name is required") 
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/ghostwriter/${id}`, { body: formData });
        return handleApiResponse(response, ApiResponse(GhostwriterSchema));
      }),

    /**
     * Delete ghostwriter and all associated data
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/ghostwriter/${input.id}`);
        return handleApiResponse(response);
      }),
  }),

  // =====================================================
  // ORIGINAL CONTENT MANAGEMENT
  // =====================================================
  
  originalContent: createTRPCRouter({
    /**
     * Get all original content for a ghostwriter
     */
    get: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/original-content/${input.gwid}`);
        return handleApiResponse(response, ApiResponse(z.array(OriginalContentSchema)));
      }),

    /**
     * Add new original content to a ghostwriter
     */
    add: baseProcedure
      .input(z.object({ 
        gwid: z.number(), 
        content: z.string().min(1, "Content is required") 
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const { gwid, ...contentData } = input;
        const formData = createFormData(contentData);
        const response = await apiClient.post(`gw/original-content/${gwid}`, { body: formData });
        return handleApiResponse(response, ApiResponse(z.object({ success: z.boolean() })));
      }),
  }),

  // =====================================================
  // GENERATED CONTENT MANAGEMENT
  // =====================================================
  
  generatedContent: createTRPCRouter({
    /**
     * Get all generated content for a ghostwriter
     */
    get: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/generated-content/${input.gwid}`);
        return handleApiResponse(response, ApiResponse(z.array(GeneratedContentSchema)));
      }),

    /**
     * Update generated content (feedback and training status)
     */
    update: baseProcedure
      .input(z.object({ id: z.number() }).merge(UpdateGeneratedContentInput))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/generated-content/${id}`, { body: formData });
        return handleApiResponse(response, ApiResponse(GeneratedContentSchema));
      }),

    /**
     * Delete generated content
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/generated-content/${input.id}`);
        return handleApiResponse(response, ApiResponse(z.object({ success: z.boolean(), message: z.string() })));
      }),
  }),

  // =====================================================
  // PSYCHOLOGY PROFILE MANAGEMENT
  // =====================================================
  
  psyProfile: createTRPCRouter({
    /**
     * Create standalone psychology profile
     */
    create: baseProcedure
      .input(CreatePsyProfileInput)
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/psyprofile', { body: formData });
        return handleApiResponse(response, ApiResponse(z.array(PsyProfileSchema)));
      }),

    /**
     * Get psychology profile by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/psyprofile/${input.id}`);
        return handleApiResponse(response, ApiResponse(PsyProfileSchema));
      }),

    /**
     * Update psychology profile
     */
    update: baseProcedure
      .input(z.object({ 
        id: z.number(),
        name: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/psyprofile/${id}`, { body: formData });
        return handleApiResponse(response, ApiResponse(PsyProfileSchema));
      }),

    /**
     * Train/improve psychology profile using marked training data
     */
    train: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.post(`gw/psyprofile/train/${input.gwid}`);
        return handleApiResponse(response, ApiResponse(z.object({ improvedPsyProfile: z.string() })));  
      }),
  }),

  // =====================================================
  // WRITING PROFILE MANAGEMENT
  // =====================================================
  
  writingProfile: createTRPCRouter({
    /**
     * Get writing profile by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/writingprofile/${input.id}`);
        return handleApiResponse(response, ApiResponse(WritingProfileSchema));
      }),

    /**
     * Update writing profile
     */
    update: baseProcedure
      .input(z.object({ 
        id: z.number(),
        name: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/writingprofile/${id}`, { body: formData });
        return handleApiResponse(response, ApiResponse(WritingProfileSchema));
      }),

    /**
     * Train/improve writing profile using marked training data
     */
    train: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.post(`gw/writingprofile/train/${input.gwid}`);
        return handleApiResponse(response, ApiResponse(z.object({ improvedWritingProfile: z.string() })));
      }),
  }),

  // =====================================================
  // CONTENT GENERATION
  // =====================================================
  
  content: createTRPCRouter({
    /**
     * Generate new content using profiles  
     */
    generate: baseProcedure
      .input(GenerateContentInput)
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/generate', { body: formData });
        return handleApiResponse(response, ApiResponse(z.object({
          content: z.string(),
          writingProfileId: z.string(),
          psychologyProfileId: z.string(),
          topic: z.string().optional(),
          gwId: z.string().optional(),
          personaProfileId: z.string().optional(),
        })));
      }),

    /**
     * Save generated content with metadata
     */
    save: baseProcedure
      .input(SaveContentInput)
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData({
          ...input,
          isTrainingData: input.isTrainingData ? 'true' : undefined,
        });
        const response = await apiClient.post('gw/save-content', { body: formData });
        return handleApiResponse(response, ApiResponse(z.object({ success: z.boolean() })));
      }),
  }),

  // =====================================================
  // PERSONA MANAGEMENT
  // =====================================================
  
  persona: createTRPCRouter({
    /**
     * Create new persona
     */
    create: baseProcedure
      .input(CreatePersonaInput)
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/persona', { body: formData });
        return handleApiResponse(response, ApiResponse(z.array(PersonaSchema)));
      }),

    /**
     * Extract persona from ghostwriter content
     */
    extract: baseProcedure
      .input(z.object({ gwId: z.string().min(1, "Ghostwriter ID is required") }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/persona-extractor', { body: formData });
        return handleApiResponse(response, ApiResponse(z.array(PersonaSchema)));
      }),

    /**
     * Get persona by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/persona/${input.id}`);
        return handleApiResponse(response, ApiResponse(PersonaSchema));
      }),

    /**
     * Update persona
     */
    update: baseProcedure
      .input(z.object({ 
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        content: z.string().min(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/persona/${id}`, { body: formData });
        return handleApiResponse(response, ApiResponse(PersonaSchema));
      }),

    /**
     * Delete persona
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/persona/${input.id}`);
        return handleApiResponse(response, ApiResponse(z.object({ message: z.string() })));
      }),
  }),

  // =====================================================
  // RESOURCE MANAGEMENT
  // =====================================================
  
  resources: createTRPCRouter({
    /**
     * Upload PDF resource
     */
    uploadPdf: baseProcedure
      .input(z.object({
        pdfFile: z.instanceof(File, { message: "Must be a File object" }),
        title: z.string().min(1, "Title is required"),
        maxPages: z.number().positive().optional(),
        encoding: z.enum(['utf-8', 'utf-16', 'ascii']).default('utf-8'),
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/pdf-resource', { body: formData });
        return handleApiResponse(response, ApiResponse(ResourceContentSchema));
      }),

    /**
     * Upload EPUB resource
     */
    uploadEpub: baseProcedure
      .input(z.object({
        epubFile: z.instanceof(File, { message: "Must be a File object" }),
        title: z.string().min(1, "Title is required"),
        includeMetadata: z.boolean().default(false),
        chapterSeparator: z.string().default('\n\n===\n\n'),
      }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/epub-resource', { body: formData });
        return handleApiResponse(response, ApiResponse(ResourceContentSchema));
      }),

    /**
     * Get all resources with pagination
     */
    list: baseProcedure
      .input(PaginationInput)
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const searchParams = new URLSearchParams({
          page: input.page.toString(),
          limit: input.limit.toString(),
        });
        const response = await apiClient.get(`gw/resources?${searchParams}`);
        return handleApiResponse(response, ApiResponse(z.array(ResourceContentSchema)));
      }),

    /**
     * Delete resource
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/resource/${input.id}`);
        return handleApiResponse(response, ApiResponse(z.object({ message: z.string() })));
      }),
  }),

  // =====================================================
  // INSIGHT EXTRACTION
  // =====================================================
  
  insights: createTRPCRouter({
    /**
     * Extract insights from resource for specific persona
     */
    extract: baseProcedure
      .input(ValueExtractorInput)
      .mutation(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/value-extractor', { body: formData });
        return handleApiResponse(response, ApiResponse(z.array(InsightSchema)));
      }),

    /**
     * Get all insights with pagination
     */
    list: baseProcedure
      .input(PaginationInput)
      .query(async ({ input }) => {
        const apiClient = createApiServerForTRPC();
        const searchParams = new URLSearchParams({
          page: input.page.toString(),
          limit: input.limit.toString(),
        });
        const response = await apiClient.get(`gw/insights?${searchParams}`);
        return handleApiResponse(response, ApiResponse(z.array(InsightSchema.extend({
          persona: z.object({ id: z.number(), name: z.string() }),
          resourceContent: z.object({ id: z.number(), title: z.string() }),
        }))));
      }),
  }),
});

// =====================================================
// TYPE EXPORTS FOR FRONTEND
// =====================================================

// Export input and output types for use in components
export type CreateGhostwriterData = z.infer<typeof CreateGhostwriterInput>;
export type GenerateContentData = z.infer<typeof GenerateContentInput>;
export type SaveContentData = z.infer<typeof SaveContentInput>;
export type CreatePersonaData = z.infer<typeof CreatePersonaInput>;
export type UpdateGeneratedContentData = z.infer<typeof UpdateGeneratedContentInput>;

// Export entity types
export type Ghostwriter = z.infer<typeof GhostwriterSchema>;
export type PsyProfile = z.infer<typeof PsyProfileSchema>;
export type WritingProfile = z.infer<typeof WritingProfileSchema>;
export type Persona = z.infer<typeof PersonaSchema>;
export type OriginalContent = z.infer<typeof OriginalContentSchema>;
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;
export type ResourceContent = z.infer<typeof ResourceContentSchema>;
export type Insight = z.infer<typeof InsightSchema>;