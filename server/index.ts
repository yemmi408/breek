import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();
const router = t.router;
const publicProcedure = t.procedure;

// To create backend functionality, add routes to the router below.
export const appRouter = router({
  /**
   * Simple ping endpoint for health checks.
   */
  ping: publicProcedure
    .query(async ({ ctx }) => {
      return "pong";
    }),
});

export type AppRouter = typeof appRouter;
