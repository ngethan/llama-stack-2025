import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

import { MercoaClient } from "@mercoa/javascript";
import { env } from "@/env";

const mercoa = new MercoaClient({
  token: env.MERCOA_API_KEY,
});

export const mercoaRouter = createTRPCRouter({
  generateMercoaToken: protectedProcedure
    .input(
      z.object({
        entityId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await mercoa.entity.getToken(input.entityId, {});
    }),
});
