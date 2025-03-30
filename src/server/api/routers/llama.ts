import { document_type, healthcareDocuments, memory } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { drizzle } from "drizzle-orm/postgres-js";

import { TIMEOUT } from "dns";
import { memo } from "react";

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

      await ctx.db.insert(memory).values({
        userId: ctx.session.user.id,
        memory: base64Image
      })

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
                "Act as an OCR assistant. Analyze the provided image and:\n1. Recognize all visible text in the image as accurately as possible.\n2. Maintain the original structure and formatting of the text.\n3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.\nProvide only the transcription without any additional comments. Then Summarize this document, until the next time I see my doctor, give me some tips/actionables to improve and maintain my health.",
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

      // const prompt = "";

      // const llamaResponse2 = await fetch("http://localhost:11434/api/chat", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     model: "llama3",
      //     messages: [
      //       {
      //         role: "user",
      //         content: prompt,
      //       },
      //       {
      //         role: "user",
      //         content: ocrText,
      //       },
      //     ],
      //     stream: false,
      //     TIMEOUT: 10000,
      //   }),
      // });

      // const result2 = await llamaResponse2.json();

      // console.log(4);
      // const ocrText2 = result.message?.content ?? "";
      // console.log("__________________________");
      // console.log(ocrText2);

      // // ocrText2 is the goat now 

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
