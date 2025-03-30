import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  healthcareDocuments,
  medicalConditions,
  chatMessages,
  document_type,
  medications,
} from "@/server/db/schema";

const documentUploadSchema = z.object({
  title: z.string(),
  type: z.enum(document_type.enumValues),
  fileUrl: z.string(),
  description: z.string().optional(),
});

const medicalConditionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  diagnosisDate: z.date().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
      }),
    )
    .optional(),
});

export const healthcareRouter = createTRPCRouter({
  uploadDocument: protectedProcedure
    .input(documentUploadSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const document = await ctx.db
          .insert(healthcareDocuments)
          .values({
            userId: ctx.session.user.id,
            ...input,
          })
          .returning();

        return document[0];
      } catch (error) {
        console.error("Error uploading document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload document",
        });
      }
    }),

  getDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const documents = await ctx.db
        .select()
        .from(healthcareDocuments)
        .where(eq(healthcareDocuments.userId, ctx.session.user.id))
        .orderBy(healthcareDocuments.createdAt);

      return documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch documents",
      });
    }
  }),

  addCondition: protectedProcedure
    .input(medicalConditionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const condition = await ctx.db
          .insert(medicalConditions)
          .values({
            userId: ctx.session.user.id,
            ...input,
          })
          .returning();

        return condition[0];
      } catch (error) {
        console.error("Error adding condition:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add medical condition",
        });
      }
    }),

  getConditions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const conditions = await ctx.db
        .select()
        .from(medicalConditions)
        .where(eq(medicalConditions.userId, ctx.session.user.id))
        .orderBy(medicalConditions.createdAt);

      return conditions;
    } catch (error) {
      console.error("Error fetching conditions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch medical conditions",
      });
    }
  }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userMessage = await ctx.db
          .insert(chatMessages)
          .values({
            userId: ctx.session.user.id,
            message: input.message,
            isUser: true,
            conversationId: input.conversationId,
          })
          .returning();

        // TODO: Implement AI response generation
        // For now, return a mock response
        const aiResponse = await ctx.db
          .insert(chatMessages)
          .values({
            userId: ctx.session.user.id,
            message: "I'm your healthcare assistant. How can I help you today?",
            isUser: false,
            conversationId: input.conversationId,
          })
          .returning();

        return {
          userMessage: userMessage[0],
          aiResponse: aiResponse[0],
        };
      } catch (error) {
        console.error("Error sending message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  getChatHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const messages = await ctx.db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, ctx.session.user.id))
        .orderBy(chatMessages.createdAt);

      return messages;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch chat history",
      });
    }
  }),

  getDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const document = await ctx.db
          .select()
          .from(healthcareDocuments)
          .where(
            and(
              eq(healthcareDocuments.id, input.id),
              eq(healthcareDocuments.userId, ctx.session.user.id),
            ),
          )
          .limit(1);

        if (!document.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        return document[0];
      } catch (error) {
        console.error("Error fetching document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch document",
        });
      }
    }),

  addMedication: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        startDate: z.string(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const medication = await ctx.db
          .insert(medications)
          .values({
            userId: ctx.session.user.id,
            ...input,
          })
          .returning();

        return medication[0];
      } catch (error) {
        console.error("Error adding medication:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add medication",
        });
      }
    }),

  getMedications: protectedProcedure.query(async ({ ctx }) => {
    try {
      const meds = await ctx.db
        .select()
        .from(medications)
        .where(eq(medications.userId, ctx.session.user.id))
        .orderBy(medications.createdAt);

      return meds;
    } catch (error) {
      console.error("Error fetching medications:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch medications",
      });
    }
  }),

  updateMedication: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        startDate: z.string(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(medications)
        .set({
          name: input.name,
          dosage: input.dosage,
          frequency: input.frequency,
          startDate: input.startDate,
          active: input.active,
        })
        .where(eq(medications.id, input.id));
    }),
});
