import { z } from "zod";

export const CODE_LANGUAGES = z.enum([
  "c",
  "cpp",
  "javascript",
  "typescript",
  "java",
  "python",
  "go",
  "swift",
  "rust",
  "ruby",
]);

export type CodeLanguage = z.infer<typeof CODE_LANGUAGES>;

export const codeExecutionSchema = z.object({
  body: z.object({
    code: z.string(),
    stdin: z.string().optional(),
    language: CODE_LANGUAGES,
  }),
});
