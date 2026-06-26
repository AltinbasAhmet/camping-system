const { z } = require("zod");

const createEventBookingSchema = z.object({
  eventId: z.number().int().positive(),
  guestCount: z.number().int().positive()
});

module.exports = {
  createEventBookingSchema
};