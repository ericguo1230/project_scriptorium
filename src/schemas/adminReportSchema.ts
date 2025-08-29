import { z } from "zod";

export const adminReportGetSchema = z.object({
  query: z.object({
    status: z.enum(["open", "closed"]).nullable(),
  }),
});
