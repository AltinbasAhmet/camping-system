const { z } = require("zod");

const createBookingSchema = z.object({
  body: z.object({
    eventId: z.number({
      required_error: "Event ID is required",
      invalid_type_error: "Event ID must be a number",
    }),
  }),
});

module.exports = {
  createBookingSchema,
};