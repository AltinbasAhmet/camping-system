const { z } = require("zod");

const searchReservationSchema = z.object({
  searchTerm: z.string().trim().min(2).optional(),
  plateNumber: z.string().trim().min(2).optional(),
  reservationCode: z.string().trim().min(2).optional(),
  customerName: z.string().trim().min(2).optional(),
  campId: z.coerce.number().int().positive().optional()
}).refine(
  (data) => data.searchTerm || data.plateNumber || data.reservationCode || data.customerName,
  { message: "License plate, reservation code, or customer name is required" }
);

module.exports = {
  searchReservationSchema
};
