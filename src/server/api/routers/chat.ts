import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { LlamaStackClient } from "llama-stack-client";
import { chatMessages, conversations, memory } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const client = new LlamaStackClient();

export const chatRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db.insert(chatMessages).values({
        userId,
        message: input.message,
        conversationId: input.conversationId,
        isUser: true,
      });

      const history = await ctx.db.query.chatMessages.findMany({
        where: eq(chatMessages.conversationId, input.conversationId),
        orderBy: (chatMessages, { asc }) => [asc(chatMessages.createdAt)],
      });

      const userMemory = await ctx.db.query.memory.findMany({
        where: eq(memory.userId, userId),
      });

      let memoryContext = "";
      if (userMemory.length > 0) {
        memoryContext =
          "User information:\n" +
          userMemory.map((mem) => mem.memory).join("\n") +
          "\n\nPlease use the above information about the user when relevant to the conversation.";
      }

      const messages = [];

      if (memoryContext) {
        messages.push({
          content: memoryContext,
          role: "system",
        });
      }

      history.forEach((msg) => {
        messages.push({
          content: msg.message,
          role: msg.isUser ? "user" : "assistant",
        });
      });

      if (
        !messages.some((m) => m.content === input.message && m.role === "user")
      ) {
        messages.push({ content: input.message, role: "user" });
      }

      const params: LlamaStackClient.InferenceChatCompletionParams = {
        messages,
        model_id: "llama-3-70b-chat",
      };

      const response = await client.inference.chatCompletion(params);

      const aiResponse = response.choices[0].message.content;

      // Save AI response to database
      const savedMessage = await ctx.db
        .insert(chatMessages)
        .values({
          userId,
          message: aiResponse,
          conversationId: input.conversationId,
          isUser: false,
        })
        .returning();

      // Update the conversation's last updated timestamp
      await ctx.db
        .update(conversations)
        .set({ lastUpdated: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return {
        message: savedMessage[0],
        conversationId: input.conversationId,
      };
    }),

  createConversation: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const newConversation = await ctx.db
      .insert(conversations)
      .values({
        userId,
      })
      .returning();

    return newConversation[0];
  }),

  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userConversations = await ctx.db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: (conversations, { desc }) => [desc(conversations.lastUpdated)],
    });

    return userConversations;
  }),

  getConversationMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.query.chatMessages.findMany({
        where: eq(chatMessages.conversationId, input.conversationId),
        orderBy: (chatMessages, { asc }) => [asc(chatMessages.createdAt)],
      });

      return messages;
    }),

  deleteConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId));

      await ctx.db
        .delete(conversations)
        .where(eq(conversations.id, input.conversationId));

      return { success: true };
    }),
});
