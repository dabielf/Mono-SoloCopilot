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
import {
  // Import all schemas from shared package
  CreateGhostwriterInput,
  CreatePsyProfileInput,
  GenerateContentInput,
  SaveContentInput,
  CreatePersonaInput,
  ValueExtractorInput,
  UpdateGeneratedContentInput,
  PaginationInput,
  TextToResourceSchema,
  type ApiResponseType,
  type ListAllResponse,
  type InsightWithRelations,
  type PaginatedResponse,
  type GenerateContentResponse,
  type CreateGhostwriterResponse,
  type PsyProfile,
  type WritingProfile,
  type Ghostwriter,
  type OriginalContent,
  type GeneratedContent,
  type Persona,
  type ResourceContent,
  type ResourceContentList,
  type Insight,
} from '@repo/zod-types';

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
      // Check if it's a File or Blob
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } 
      // Check if it looks like a serialized File object
      else if (
        typeof value === 'object' && 
        'name' in value && 
        'type' in value && 
        'size' in value &&
        'lastModified' in value
      ) {
        // It's likely a serialized File, create a Blob from it
        // This shouldn't happen with proper File handling, but just in case
        console.warn(`${key} appears to be a serialized File object, attempting to reconstruct`);
        const blob = new Blob([value as any], { type: (value as any).type });
        formData.append(key, blob, (value as any).name);
      }
      else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
}

/**
 * Handle API responses and throw TRPC errors for failures
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json() as ApiResponseType<T>;
  
  if (response.status !== 200) {
    if ('error' in data && data.error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: data.error.message || 'API request failed',
        cause: data.error,
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'API request failed',
    });
  }
  
  if (!data.success) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: data.error.message,
      cause: data.error,
    });
  }
  
  return data.data;
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
    .query(async (): Promise<ListAllResponse> => {
      const apiClient = createApiServerForTRPC();
      const response = await apiClient.get('gw');
      return handleApiResponse<ListAllResponse>(response);
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
      .mutation(async ({ input }): Promise<CreateGhostwriterResponse> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw', { body: formData });
        return handleApiResponse<CreateGhostwriterResponse>(response);
      }),

    /**
     * Get a specific ghostwriter by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }): Promise<Ghostwriter> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/ghostwriter/${input.id}`);
        return handleApiResponse<Ghostwriter>(response);
      }),

    /**
     * Update ghostwriter name
     */
    update: baseProcedure
      .input(z.object({ 
        id: z.number(), 
        name: z.string().min(1, "Name is required") 
      }))
      .mutation(async ({ input }): Promise<Ghostwriter> => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/ghostwriter/${id}`, { body: formData });
        return handleApiResponse<Ghostwriter>(response);
      }),

    /**
     * Delete ghostwriter and all associated data
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }): Promise<{ success: boolean; message: string }> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/ghostwriter/${input.id}`);
        return handleApiResponse<{ success: boolean; message: string }>(response);
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
      .query(async ({ input }): Promise<OriginalContent[]> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/original-content/${input.gwid}`);
        return handleApiResponse<OriginalContent[]>(response);
      }),

    /**
     * Add new original content to a ghostwriter
     */
    add: baseProcedure
      .input(z.object({ 
        gwid: z.number(), 
        content: z.string().min(1, "Content is required") 
      }))
      .mutation(async ({ input }): Promise<{ success: boolean }> => {
        const apiClient = createApiServerForTRPC();
        const { gwid, ...contentData } = input;
        const formData = createFormData(contentData);
        const response = await apiClient.post(`gw/original-content/${gwid}`, { body: formData });
        return handleApiResponse<{ success: boolean }>(response);
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
      .query(async ({ input }): Promise<GeneratedContent[]> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/generated-content/${input.gwid}`);
        return handleApiResponse<GeneratedContent[]>(response);
      }),

    /**
     * Update generated content (feedback and training status)
     */
    update: baseProcedure
      .input(z.object({ id: z.number() }).merge(UpdateGeneratedContentInput))
      .mutation(async ({ input }): Promise<GeneratedContent> => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/generated-content/${id}`, { body: formData });
        return handleApiResponse<GeneratedContent>(response);
      }),

    /**
     * Delete generated content
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }): Promise<{ success: boolean; message: string }> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/generated-content/${input.id}`);
        return handleApiResponse<{ success: boolean; message: string }>(response);
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
      .mutation(async ({ input }): Promise<PsyProfile[]> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/psyprofile', { body: formData });
        return handleApiResponse<PsyProfile[]>(response);
      }),

    /**
     * Get psychology profile by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }): Promise<PsyProfile> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/psyprofile/${input.id}`);
        return handleApiResponse<PsyProfile>(response);
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
      .mutation(async ({ input }): Promise<PsyProfile> => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/psyprofile/${id}`, { body: formData });
        return handleApiResponse<PsyProfile>(response);
      }),

    /**
     * Create psychology profile for a ghostwriter
     */
    createForGhostwriter: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .mutation(async ({ input }): Promise<PsyProfile> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.post(`gw/psyprofile/create/${input.gwid}`);
        return handleApiResponse<PsyProfile>(response);
      }),

    /**
     * Train/improve psychology profile using marked training data
     */
    train: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .mutation(async ({ input }): Promise<{ improvedPsyProfile: string }> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.post(`gw/psyprofile/train/${input.gwid}`);
        return handleApiResponse<{ improvedPsyProfile: string }>(response);  
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
      .query(async ({ input }): Promise<WritingProfile> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/writingprofile/${input.id}`);
        return handleApiResponse<WritingProfile>(response);
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
      .mutation(async ({ input }): Promise<WritingProfile> => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/writingprofile/${id}`, { body: formData });
        return handleApiResponse<WritingProfile>(response);
      }),

    /**
     * Create writing profile for a ghostwriter
     */
    createForGhostwriter: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .mutation(async ({ input }): Promise<WritingProfile> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.post(`gw/writingprofile/create/${input.gwid}`);
        return handleApiResponse<WritingProfile>(response);
      }),

    /**
     * Train/improve writing profile using marked training data
     */
    train: baseProcedure
      .input(z.object({ gwid: z.number() }))
      .mutation(async ({ input }): Promise<{ improvedWritingProfile: string }> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.post(`gw/writingprofile/train/${input.gwid}`);
        return handleApiResponse<{ improvedWritingProfile: string }>(response);
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
      .mutation(async ({ input }): Promise<GenerateContentResponse> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/generate', { body: formData });
        return handleApiResponse<GenerateContentResponse>(response);
      }),

    /**
     * Save generated content with metadata
     */
    save: baseProcedure
      .input(SaveContentInput)
      .mutation(async ({ input }): Promise<{ success: boolean }> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData({
          ...input,
          isTrainingData: input.isTrainingData ? 'true' : undefined,
        });
        const response = await apiClient.post('gw/save-content', { body: formData });
        return handleApiResponse<{ success: boolean }>(response);
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
      .mutation(async ({ input }): Promise<Persona[]> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/persona', { body: formData });
        return handleApiResponse<Persona[]>(response);
      }),

    /**
     * Extract persona from ghostwriter content
     */
    extract: baseProcedure
      .input(z.object({ gwId: z.string().min(1, "Ghostwriter ID is required") }))
      .mutation(async ({ input }): Promise<Persona[]> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/persona-extractor', { body: formData });
        return handleApiResponse<Persona[]>(response);
      }),

    /**
     * Get persona by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }): Promise<Persona> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/persona/${input.id}`);
        return handleApiResponse<Persona>(response);
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
      .mutation(async ({ input }): Promise<Persona> => {
        const apiClient = createApiServerForTRPC();
        const { id, ...updateData } = input;
        const formData = createFormData(updateData);
        const response = await apiClient.patch(`gw/persona/${id}`, { body: formData });
        return handleApiResponse<Persona>(response);
      }),

    /**
     * Delete persona
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }): Promise<{ success: boolean; message: string }> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/persona/${input.id}`);
        return handleApiResponse<{ success: boolean; message: string }>(response);
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
        pdfFile: z.any(), // Accept any type, will validate as File on client
        title: z.string().min(1, "Title is required"),
        maxPages: z.number().positive().optional(),
        encoding: z.enum(['utf-8', 'utf-16', 'ascii']).default('utf-8'),
      }))
      .mutation(async ({ input }): Promise<ResourceContent> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/pdf-resource', { body: formData });
        return handleApiResponse<ResourceContent>(response);
      }),

    /**
     * Upload EPUB resource
     */
    uploadEpub: baseProcedure
      .input(z.object({
        epubFile: z.any(), // Accept any type, will validate as File on client
        title: z.string().min(1, "Title is required"),
        includeMetadata: z.boolean().default(false),
        chapterSeparator: z.string().default('\n\n===\n\n'),
      }))
      .mutation(async ({ input }): Promise<ResourceContent> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/epub-resource', { body: formData });
        return handleApiResponse<ResourceContent>(response);
      }),

    /**
     * Upload text resource
     */
    uploadText: baseProcedure
      .input(TextToResourceSchema)
      .mutation(async ({ input }): Promise<ResourceContent> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/text-resource', { body: formData });
        return handleApiResponse<ResourceContent>(response);
      }),

    /**
     * Get all resources with pagination
     */
    list: baseProcedure
      .input(PaginationInput)
      .query(async ({ input }): Promise<PaginatedResponse<ResourceContentList>> => {
        const apiClient = createApiServerForTRPC();
        const searchParams = new URLSearchParams({
          page: input.page.toString(),
          limit: input.limit.toString(),
        });
        const response = await apiClient.get(`gw/resources?${searchParams}`);
        const apiData = await response.json() as ApiResponseType<ResourceContentList[]>;
        
        if (!apiData.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: apiData.error.message,
            cause: apiData.error,
          });
        }
        
        return {
          data: apiData.data,
          meta: apiData.meta
        } as PaginatedResponse<ResourceContentList>;
      }),

    /**
     * Get single resource by ID
     */
    get: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }): Promise<ResourceContent> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.get(`gw/resource/${input.id}`);
        return handleApiResponse<ResourceContent>(response);
      }),

    /**
     * Delete resource
     */
    delete: baseProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }): Promise<{ success: boolean; message: string }> => {
        const apiClient = createApiServerForTRPC();
        const response = await apiClient.delete(`gw/resource/${input.id}`);
        return handleApiResponse<{ success: boolean; message: string }>(response);
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
      .mutation(async ({ input }): Promise<Insight[]> => {
        const apiClient = createApiServerForTRPC();
        const formData = createFormData(input);
        const response = await apiClient.post('gw/value-extractor', { body: formData });
        return handleApiResponse<Insight[]>(response);
      }),

    /**
     * Get all insights with pagination
     */
    list: baseProcedure
      .input(PaginationInput.extend({
        personaId: z.string().optional(),
      }))
      .query(async ({ input }): Promise<PaginatedResponse<InsightWithRelations>> => {
        const apiClient = createApiServerForTRPC();
        const searchParams = new URLSearchParams({
          page: input.page.toString(),
          limit: input.limit.toString(),
        });
        if (input.personaId) {
          searchParams.append('personaId', input.personaId);
        }
        const response = await apiClient.get(`gw/insights?${searchParams}`);
        const apiData = await response.json() as ApiResponseType<InsightWithRelations[]>;
        
        if (!apiData.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: apiData.error.message,
            cause: apiData.error,
          });
        }
        
        return {
          data: apiData.data,
          meta: apiData.meta
        } as PaginatedResponse<InsightWithRelations>;
      }),
  }),
});

