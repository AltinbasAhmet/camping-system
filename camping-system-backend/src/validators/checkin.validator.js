const { z } = require("zod");

const searchReservationSchema = z.object({
  searchTerm: z.string().trim().min(2).optional(),
  plateNumber: z.string().trim().min(2).optional(),
  reservationCode: z.string().trim().min(2).optional(),
  customerName: z.string().trim().min(2).optional(),
  campId: z.coerce.number().int().positive().optional()
}).refine(
  (data) => data.searchTerm || data.plateNumber || data.reservationCode || data.customerName,
  { message: "Plaka, rezervasyon kodu veya müşteri adı zorunludur" }
);

module.exports = {
  searchReservationSchema
};
