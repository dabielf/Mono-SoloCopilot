import { initTRPC } from '@trpc/server';
import { auth } from '@clerk/nextjs/server';
import { cache } from "react";
import superjson from "superjson";

// export const createTRPCContext = cache(async (opts: CreateNextContextOptions) => {
   
//    // Get user session from Clerk
//    const { userId, getToken } = await auth();
   
//    return {
//      ...opts,
//      userId,
//      token: getToken(),
//    };
// });

// export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = cache(async () => {
	/**
	 * @see: https://trpc.io/docs/server/context
	 */
	return { userId: "user_123" };
});

const t = initTRPC.create({
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const { userId, getToken } = await auth();
  
  return next({
    ctx: {
      userId,
      token: getToken(),
    },
  });
});