const { z } = require("zod");

const searchReservationSchema = z.object({
  plateNumber: z.string().trim().min(3).optional(),
  reservationCode: z.string().trim().min(3).optional(),
  campId: z.coerce.number().int().positive().optional()
}).refine((data) => data.plateNumber || data.reservationCode, {
  message: "Plaka veya rezervasyon kodu zorunludur"
});

module.exports = {
  searchReservationSchema
};
