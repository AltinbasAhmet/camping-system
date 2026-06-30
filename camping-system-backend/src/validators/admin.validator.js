const { z } = require("zod");

const createOwnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6)
});

module.exports = {
  createOwnerSchema
};