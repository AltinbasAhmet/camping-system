const { z } = require("zod");

const optionalTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format").nullable().optional();

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
  checkInTime: optionalTimeSchema,
  checkOutTime: optionalTimeSchema,

  hasToilet: z.boolean().optional(),
  hasShower: z.boolean().optional(),
  hasHotWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  hasMarket: z.boolean().optional(),
  petFriendly: z.boolean().optional()
});

const updateCampSchema = createCampSchema.partial();

// For a camp owner creating their own campsite: ownerId does not come from
// the body, it's set on the controller side from the logged-in user's id.
const createOwnCampSchema = createCampSchema.omit({ ownerId: true });

const updateOwnCampSchema = createOwnCampSchema.partial();

module.exports = {
  createCampSchema,
  updateCampSchema,
  createOwnCampSchema,
  updateOwnCampSchema
};