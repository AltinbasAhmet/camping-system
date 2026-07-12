const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "CAMP_OWNER"]).optional(),

  // Kamp sahibi başvurusu: admin, kişiyi onaylayıp onaylamayacağına bu
  // bilgilere (ve varsa fotoğrafa) bakarak karar verir. multipart/form-data
  // ile geldiği için sayısal alanlar coerce edilir.
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
}).refine(
  (data) =>
    data.role !== "CAMP_OWNER" ||
    (data.campName && data.campDescription && data.campCity && data.campAddress &&
      data.campPhone && data.campTotalCapacity && data.campCaravanCapacity),
  {
    message: "Kamp sahibi başvurusu için kamp adı, açıklama, şehir, adres, telefon ve kapasite bilgileri zorunludur",
    path: ["campName"]
  }
);

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