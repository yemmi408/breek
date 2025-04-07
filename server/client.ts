import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '.';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc/',
    }),
  ],
});

// Backend functions are defined in server/index.ts. To call them, see the below example:

// import { trpc } from './client'
// const pong = await trpc.ping.query()
