import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { healthcareRouter } from "./routers/healthcare";
import { llamaRouter } from "./routers/llama";
import { chatRouter } from "./routers/chat";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  healthcare: healthcareRouter,
  llama: llamaRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
