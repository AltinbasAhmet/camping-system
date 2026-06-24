const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "CAMP_OWNER", "SYSTEM_ADMIN", "STAFF"]).optional()
}).refine((data) => data.email || data.phone, {
  message: "Email or phone is required"
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6)
}).refine((data) => data.email || data.phone, {
  message: "Email or phone is required"
});

module.exports = {
  registerSchema,
  loginSchema
};