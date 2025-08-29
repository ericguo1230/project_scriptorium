import { z } from "zod";

export const blogPostGetSchema = z.object({
  query: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    templateContent: z.string().nullable(),
    tags: z.string().nullable(),
    sortBy: z
      .enum(["createdAt", "rating", "report", "controversial"])
      .nullable(),
    sortDirection: z.enum(["asc", "desc"]).nullable(),
  }),
});

export const commentGetSchema = z.object({
  query: z.object({
    sortBy: z
      .enum(["createdAt", "rating", "report", "controversial"])
      .nullable(),
    sortDirection: z.enum(["asc", "desc"]).nullable(),
  }),
});
