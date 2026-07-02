const { z } = require("zod");

const searchByPlateSchema = z.object({
  plateNumber: z.string().min(2)
});

const searchByCodeSchema = z.object({
  reservationCode: z.string().min(3)
});

module.exports = {
  searchByPlateSchema,
  searchByCodeSchema
};