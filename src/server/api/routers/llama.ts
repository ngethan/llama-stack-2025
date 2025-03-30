import { document_type, healthcareDocuments } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { LlamaStackClient } from "llama-stack-client";

const client = new LlamaStackClient({
  // baseURL: "http://localhost:11434",
  timeout: 10000,
});
export const llamaRouter = createTRPCRouter({
  ocr: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.enum(document_type.enumValues),
        fileUrl: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await fetch(input.fileUrl);
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64Image = buffer.toString("base64");

        const result = await client.inference.chatCompletion({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  image: {
                    data: base64Image,
                  },
                  prompt:
                    "Act as an OCR assistant. Analyze the provided image and:\n1. Recognize all visible text in the image as accurately as possible.\n2. Maintain the original structure and formatting of the text.\n3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.\nProvide only the transcription without any additional comments.",
                },
              ],
            },
          ],
        });

        console.log(result);

        const ocrText =
          typeof result.completion_message.content === "object"
            ? JSON.stringify(result.completion_message.content)
            : String(result.completion_message.content);

        const document = await ctx.db
          .insert(healthcareDocuments)
          .values({
            userId: ctx.session.user.id,
            ocrText: ocrText,
            ...input,
          })
          .returning();

        return {
          success: true,
          text: ocrText,
          document,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "OCR processing failed",
          text: null,
        };
      }
    }),
});
