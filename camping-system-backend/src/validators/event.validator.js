const { z } = require("zod");

const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    dateTime: z.string().datetime("Invalid date format"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
  }),
});

const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    dateTime: z.string().datetime().optional(),
    capacity: z.number().min(1).optional(),
  }),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
};