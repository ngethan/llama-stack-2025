import { document_type, healthcareDocuments } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TIMEOUT } from "dns";

export const llamaRouter = createTRPCRouter({
  ocr: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.enum(document_type.enumValues),
        base64Data: z.string(),
        publicUrl: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // try {
      const base64Image = input.base64Data;
      const llamaResponse = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2-vision",
          messages: [
            {
              role: "user",
              content:
                "Act as an OCR assistant. Analyze the provided image and:\n1. Recognize all visible text in the image as accurately as possible.\n2. Maintain the original structure and formatting of the text.\n3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.\nProvide only the transcription without any additional comments.",
              images: [base64Image],
            },
          ],
          stream: false,
          TIMEOUT: 10000,
        }),
      });

      console.log(2);
      if (!llamaResponse.ok) {
        throw new Error(`Llama API error: ${llamaResponse.statusText}`);
      }
      console.log(3);

      console.log(llamaResponse);
      const result = await llamaResponse.json();

      console.log(4);
      const ocrText = result.message?.content ?? "";
      console.log(ocrText);

      const document = await ctx.db
        .insert(healthcareDocuments)
        .values({
          userId: ctx.session.user.id,
          ocrText: ocrText as string,
          fileUrl: input.publicUrl,
          ...input,
        })
        .returning();
      console.log(6);

      return {
        success: true,
        text: ocrText,
        document,
      };
      // } catch (error) {
      //   return {
      //     success: false,
      //     error:
      //       error instanceof Error ? error.message : "OCR processing failed",
      //     text: null,
      //   };
      // }
    }),
});
