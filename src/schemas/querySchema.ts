import { z } from "zod";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/utils/pagination";

function stringToPositiveInt(defaultValue: number) {
  return z
    .string()
    .nullable()
    .transform((val) => {
      const parsed = val ? parseInt(val) : defaultValue;
      return isNaN(parsed) ? defaultValue : parsed;
    })
    .refine((val) => val > 0, {
      message: "Value must be greater than 0",
    });
}

export const querySchema = z.object({
  page: stringToPositiveInt(DEFAULT_PAGE),
  limit: stringToPositiveInt(DEFAULT_LIMIT),
});
