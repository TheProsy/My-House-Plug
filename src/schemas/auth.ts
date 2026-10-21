import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    accountType: z.enum(["renter", "landlord", "agent"]),
    acceptTerms: z.literal(true, {
      error: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
