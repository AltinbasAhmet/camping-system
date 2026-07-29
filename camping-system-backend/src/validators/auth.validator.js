const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  notificationChannel: z.enum(["EMAIL", "SMS"]),
  role: z.enum(["USER", "CAMP_OWNER"]).optional(),

  // Camp owner application: the admin decides whether to approve the
  // person based on this information (and photo, if any). Numeric fields
  // are coerced since this comes in as multipart/form-data.
  campName: z.string().min(2).optional(),
  campDescription: z.string().min(10).optional(),
  campCity: z.string().min(2).optional(),
  campDistrict: z.string().optional(),
  campAddress: z.string().min(5).optional(),
  campPhone: z.string().min(10).optional(),
  campTotalCapacity: z.coerce.number().int().positive().optional(),
  campCaravanCapacity: z.coerce.number().int().positive().optional(),
  campTentCapacity: z.coerce.number().int().nonnegative().optional(),
  campPricePerNight: z.coerce.number().positive().optional()
}).refine((data) => data.email || data.phone, {
  message: "Email or phone is required"
}).refine((data) => data.notificationChannel !== "EMAIL" || Boolean(data.email), {
  message: "An email address is required for email verification",
  path: ["email"]
}).refine((data) => data.notificationChannel !== "SMS" || Boolean(data.phone), {
  message: "A phone number is required for SMS verification",
  path: ["phone"]
}).refine(
  (data) =>
    data.role !== "CAMP_OWNER" ||
    (data.campName && data.campDescription && data.campCity && data.campAddress &&
      data.campPhone && data.campTotalCapacity && data.campCaravanCapacity),
  {
    message: "Campsite name, description, city, address, phone, and capacity information are required for a camp owner application",
    path: ["campName"]
  }
);

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6),
  notificationChannel: z.enum(["EMAIL", "SMS"])
}).refine((data) => data.email || data.phone, {
  message: "Email or phone is required"
});

const verifyOtpSchema = z.object({
  userId: z.coerce.number().int().positive(),
  code: z.string().min(4).max(8)
});

const resendOtpSchema = z.object({
  userId: z.coerce.number().int().positive(),
  notificationChannel: z.enum(["EMAIL", "SMS"])
});

const forgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  notificationChannel: z.enum(["EMAIL", "SMS"])
}).refine((data) => data.email || data.phone, {
  message: "E-posta veya telefon zorunludur"
}).refine((data) => data.notificationChannel !== "EMAIL" || Boolean(data.email), {
  message: "An email address is required to receive the code by email",
  path: ["email"]
}).refine((data) => data.notificationChannel !== "SMS" || Boolean(data.phone), {
  message: "A phone number is required to receive the code by SMS",
  path: ["phone"]
});

const resetPasswordSchema = z.object({
  userId: z.coerce.number().int().positive(),
  code: z.string().min(4).max(8),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
