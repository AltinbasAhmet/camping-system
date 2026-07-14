const { z } = require("zod");

const searchByPlateSchema = z.object({
  plateNumber: z.string().min(5)
});

module.exports = {
  searchByPlateSchema
};