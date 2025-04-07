import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Env } from './ts/worker-configuration';

// A context object is created by the below function and provided to each TRPC
// route. It's a good place to define common functionality like database
// connections that are used by all routes.
export const createContext = async (
  env: Env,
  options: FetchCreateContextFnOptions,
) => {
  return { env };
};

export type Context = inferAsyncReturnType<typeof createContext>;
