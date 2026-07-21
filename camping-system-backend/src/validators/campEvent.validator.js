const { z } = require("zod");

const createCampEventSchema = z.object({
  campId: z.number().int().positive(),
  title: z.string().min(2),
  description: z.string().min(10),
  dateTime: z.string().min(1),
  capacity: z.number().int().positive(),
  price: z.number().min(0)
});

const updateCampEventSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  dateTime: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().min(0).optional()
});

module.exports = {
  createCampEventSchema,
  updateCampEventSchema
};