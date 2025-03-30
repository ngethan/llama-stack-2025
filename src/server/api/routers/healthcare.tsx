import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  healthcareDocuments,
  medicalConditions,
  chatMessages,
  document_type,
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Save user message
        const userMessage = await ctx.db
          .insert(chatMessages)
          .values({
            userId: ctx.session.user.id,
            message: input.message,
            isUser: true,
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
});
