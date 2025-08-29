import { z } from "zod";
import { zfd } from "zod-form-data";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const userUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
  }),
});

export const avatarUploadSchema = z.object({
  body: zfd.formData({
    file: zfd
      .file()
      .refine(
        (file) => {
          const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
          return allowedTypes.includes(file.type);
        },
        { message: "Invalid file type. Please upload a valid image file." },
      )
      .refine((file) => file.size < MAX_FILE_SIZE, {
        message: "File size must be less than 5MB",
      }),
  }),
});
