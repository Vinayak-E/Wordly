import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  email: z.string().email("Invalid email"),
  dob: z
  .string()
  .min(1, "Date of birth is required")
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date < new Date();
  }, "Invalid or future date"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  preferences: z.array(z.string()).min(1, "Select at least one preference"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;


export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email").optional(), 
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date < new Date();
      },
      "Invalid or future date"
    ),
  profileImage: z.string().url("Invalid image URL").optional(), 
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;