import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

export const authRegisterSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Please enter a valid email address")
        .transform((value) => value.toLowerCase()),
      password: z.string({ required_error: "Password is required" })
        .min(PASSWORD_MIN_LENGTH, {
          message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        }).trim(),
      confirmPassword: z.string({ required_error: "Please confirm your password" }).trim(),
      firstName: z.string({ required_error: "First name is required" })
        .min(1, "First name cannot be empty"),
      lastName: z.string({ required_error: "Last name is required" })
        .min(1, "Last name cannot be empty"),
      phoneNumber: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const authLoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email()
      .transform((value) => value.toLowerCase()),
    password: z.string(),
  }),
});

export const authResetPasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string(),
      newPassword: z.string().min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from the current password",
    }),
});
