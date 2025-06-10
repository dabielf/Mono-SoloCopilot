/**
 * tRPC client configuration
 * This sets up the type-safe client for frontend usage
 */
import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '~/server/api/root';

/**
 * A set of type-safe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();