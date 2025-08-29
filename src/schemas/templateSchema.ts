import { z } from "zod";
import { CODE_LANGUAGES } from "@/schemas/codeExecutionSchema";

export const templateCreateSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string(),
    code: z.string(),
    stdin: z.string().optional(),
    language: CODE_LANGUAGES,
    tags: z.array(z.string()).optional(),
  }),
});

export const templateUpdateSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    code: z.string().optional(),
    stdin: z.string().optional(),
    language: CODE_LANGUAGES.optional(),
    tags: z.array(z.string()).optional(),
  }),
});
