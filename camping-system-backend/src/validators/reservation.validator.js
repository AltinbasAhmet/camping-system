const { z } = require("zod");

const createReservationSchema = z.object({
  campId: z.number().int().positive(),

  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),

  plateNumber: z.string().min(5),
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
});

module.exports = {
  createReservationSchema
};