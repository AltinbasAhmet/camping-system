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

module.exports = {
  updateUserRoleSchema,
  updateUserVerificationSchema,
  updateCampByAdminSchema,
  updateReservationStatusSchema
};
