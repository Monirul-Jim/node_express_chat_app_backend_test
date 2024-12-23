import { z } from "zod";

const UserStatus = z.enum(["active", "blocked"]);
const UserRole = z.enum(["admin", "user"]);

const createUserRegistrationValidationSchema = z.object({
  body: z.object({
    firstName: z.string({ message: "First name is required" }),
    lastName: z.string({ message: "Last name is required" }),
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    role: UserRole.optional().default("user"),
    status: UserStatus.optional().default("active"),
    isDeleted: z.boolean().optional().default(false),
  }),
});
const updateIsDeletedSchema = z.object({
  body: z.object({
    isDeleted: z.boolean(),
  }),
});

const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "user"]),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "blocked"]),
  }),
});

export const userRegistrationValidationSchema = {
  createUserRegistrationValidationSchema,
  updateIsDeletedSchema,
  updateRoleSchema,
  updateStatusSchema,
};
