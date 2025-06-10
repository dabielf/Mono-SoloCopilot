import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { apiServer } from '@/modules/api/ky';
import { gwRouter } from './gw';


export const appRouter = createTRPCRouter({
  gw: gwRouter,
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
    userData: baseProcedure.query(() => {
      return apiServer().get('gw').json()
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;