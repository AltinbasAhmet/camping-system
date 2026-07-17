const { z } = require("zod");

const createReservationSchema = z.object({
  campId: z.number().int().positive(),

  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),

  accommodationType: z.enum(["TENT", "CARAVAN"]),
  plateNumber: z.string().min(5).optional(),
  guestCount: z.number().int().positive(),

  guests: z.array(
    z.object({
      fullName: z.string().min(2),
      nationalId: z.string().optional()
    })
  ).min(1)
}).refine((data) => data.guests.length === data.guestCount, {
  message: "Guest count must match guests array length",
  path: ["guests"]
}).refine((data) => data.accommodationType !== "CARAVAN" || Boolean(data.plateNumber), {
  message: "Karavan ile gelenler için plaka zorunludur",
  path: ["plateNumber"]
});

module.exports = {
  createReservationSchema
};