import { z } from "zod";

export const blogPostCreateSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    links: z.array(z.number()).optional(),
  }),
});

export const blogPostUpdateSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    links: z.array(z.number()).optional(),
  }),
});

export const blogPostGetSchema = z.object({
  query: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    templateContent: z.string().nullable(),
    tags: z.string().nullable(),
    sortBy: z.enum(["createdAt", "rating", "controversial"]).nullable(),
    sortDirection: z.enum(["asc", "desc"]).nullable(),
  }),
});

export const blogPostRateSchema = z.object({
  body: z.object({
    rating: z.enum(["+1", "-1"]),
  }),
});

export const blogPostReportSchema = z.object({
  body: z.object({
    explanation: z.string(),
  }),
});

export const commentGetSchema = z.object({
  query: z.object({
    sortBy: z.enum(["createdAt", "rating", "controversial"]).nullable(),
    sortDirection: z.enum(["asc", "desc"]).nullable(),
  }),
});

export const commentUpdateSchema = z.object({
  body: z.object({
    content: z.string(),
  }),
});

export const commentCreateSchema = z.object({
  body: z.object({
    content: z.string(),
    parentId: z.number().int().optional().nullable(),
  }),
});
