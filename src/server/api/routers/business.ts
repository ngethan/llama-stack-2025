import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { businesses, businessRepresentatives } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  businessRepresentativeSchema,
  formSchema as kybIntakeFormSchema,
} from "@/types/forms/kyb-intake";
import { TRPCError } from "@trpc/server";

export const businessRouter = createTRPCRouter({
  saveKYB: protectedProcedure
    .input(
      z.object({
        business: kybIntakeFormSchema,
        representatives: businessRepresentativeSchema.array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(input);

        // insert reps
        const repsData = await ctx.db
          .insert(businessRepresentatives)
          .values(
            input.representatives.map((r) => ({
              businessId: ctx.session.user.id,
              ...r,
            })),
          )
          .execute();

        // update business
        const businessData = await ctx.db
          .update(businesses)
          .set(input.business)
          .where(eq(businesses.id, ctx.session.user.id))
          .execute();

        return {
          business: businessData,
          representatives: repsData,
        };
      } catch (error) {
        console.error("Server error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid user",
        });
      }
    }),
});
