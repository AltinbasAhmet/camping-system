const { z } = require("zod");

const createCampCommentSchema = z.object({
  content: z.string().trim().min(3, "Comment must be at least 3 characters long").max(1000, "Yorum en fazla 1000 karakter olabilir"),
  rating: z.coerce.number().int().min(1).max(5).optional()
});

module.exports = { createCampCommentSchema };
