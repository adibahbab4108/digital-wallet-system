import z from "zod";
import { Role, userStatus } from "./user.interface";

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;

export const createUserZodSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be between 3 and 50 characters" }).optional(),
  email: z
    .string()
    .email()
    .refine((val) => val.includes("@"), { message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must not exceed 20 characters" })
    .regex(passwordRegex, {
      message:
        "Password must contain letters, numbers, and a special character (@$!%*?&)",
    })
    .optional(),
  phone: z
    .string()
    .regex(phoneRegex, {
      message:
        "Phone number must be a valid Bangladeshi number (e.g. 01XXXXXXXXX)",
    })
    .optional(),
  address: z
    .string()
    .min(3, { message: "Address must be provided" })
    .optional(),

  userStatus: z.enum(Object.values(userStatus) as [string]).optional(),
  isDeleted: z.boolean().optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  
});

export const updateUserZodSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be between 3 and 50 characters" })
    .optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must not exceed 20 characters" })
    .regex(passwordRegex, {
      message:
        "Password must contain letters, numbers, and a special character (@$!%*?&)",
    })
    .optional(),
  phone: z
    .string()
    .regex(phoneRegex, {
      message:
        "Phone number must be a valid Bangladeshi number (e.g. 01XXXXXXXXX)",
    })
    .optional(),
  address: z
    .string()
    .min(3, { message: "Address must be provided" })
    .optional(),

  userStatus: z.enum(Object.values(userStatus) as [string]).optional(),
  isDeleted: z.boolean().optional(),
  isVerified: z.boolean({ error: "isVerified must be boolean" }).optional(),
  role: z.enum(Object.values(Role) as [string]),
});
