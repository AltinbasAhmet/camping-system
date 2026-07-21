const { z } = require("zod");

const createCampSchema = z.object({
  ownerId: z.number(),
  name: z.string().min(2),
  description: z.string().min(10),
  city: z.string().min(2),
  district: z.string().optional(),
  address: z.string().min(5),
  phone: z.string().min(10),
  email: z.string().email().optional(),

  totalCapacity: z.number().int().positive(),
  caravanCapacity: z.number().int().positive(),
  tentCapacity: z.number().int().optional(),

  pricePerNight: z.number().positive().optional(),

  hasToilet: z.boolean().optional(),
  hasShower: z.boolean().optional(),
  hasHotWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  hasMarket: z.boolean().optional(),
  petFriendly: z.boolean().optional()
});

const updateCampSchema = createCampSchema.partial();

// Kamp sahibinin kendi kampını oluşturması için: ownerId body'den gelmez,
// giriş yapmış kullanıcının id'si controller tarafında set edilir.
const createOwnCampSchema = createCampSchema.omit({ ownerId: true });

const updateOwnCampSchema = createOwnCampSchema.partial();

module.exports = {
  createCampSchema,
  updateCampSchema,
  createOwnCampSchema,
  updateOwnCampSchema
};