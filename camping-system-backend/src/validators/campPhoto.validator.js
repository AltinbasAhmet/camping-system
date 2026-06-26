const { z } = require("zod");

const createCampPhotoSchema = z.object({
  imageUrl: z.string().url(),
  isCover: z.boolean().optional()
});

module.exports = {
  createCampPhotoSchema
};