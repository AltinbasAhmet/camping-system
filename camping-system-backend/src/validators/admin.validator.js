const { z } = require("zod");
const { createCampSchema } = require("./camp.validator");

const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "CAMP_OWNER", "SYSTEM_ADMIN", "STAFF"])
});

const updateUserVerificationSchema = z.object({
  verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"])
});

// Admin bir kampın her alanını değiştirebilir, status dahil.
const updateCampByAdminSchema = createCampSchema
  .omit({ ownerId: true })
  .partial()
  .extend({
    status: z.enum(["PENDING", "ACTIVE", "PASSIVE", "REJECTED"]).optional()
  });

const updateReservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "CHECKED_IN", "CHECKED_OUT"])
});

const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Personel adı en az 2 karakter olmalıdır"),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(10).optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır")
}).refine((data) => data.email || data.phone, {
  message: "E-posta veya telefon numarası zorunludur"
});

const assignStaffSchema = z.object({
  userId: z.coerce.number().int().positive()
});

module.exports = {
  updateUserRoleSchema,
  updateUserVerificationSchema,
  updateCampByAdminSchema,
  updateReservationStatusSchema,
  createStaffSchema,
  assignStaffSchema
};
