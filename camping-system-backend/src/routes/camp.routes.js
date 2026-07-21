const express = require("express");
const campController = require("../controllers/camp.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createCampSchema,
  updateCampSchema,
  createOwnCampSchema,
  updateOwnCampSchema
} = require("../validators/camp.validator");
const { z } = require("zod");

const router = express.Router();

router.post(
  "/admin/create",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  validate(createCampSchema),
  campController.createCampByAdmin
);

// Minimal admin onay endpoint'i: tam admin paneli ayrı bir iş kalemi olarak
// planlandı, bu sadece owner'ın ekleyebildiği PENDING kampları ACTIVE'e
// çekebilmek için gereken en küçük parça.
router.patch(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  validate(z.object({ status: z.enum(["PENDING", "ACTIVE", "PASSIVE", "REJECTED"]) })),
  campController.setCampStatus
);

router.get(
  "/owner/my-camp",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  campController.getMyCamp
);

router.get(
  "/owner/my-camps",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  campController.getMyCamps
);

// Kamp sahibi kendi kampını ekler (yeni). Kamp PENDING olarak oluşur,
// admin onayından sonra herkese açık listede görünür.
router.post(
  "/owner/my-camps",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(createOwnCampSchema),
  campController.createMyCamp
);

// Birden fazla kampı olan sahipler için id bazlı güncelleme.
router.put(
  "/owner/my-camps/:id",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(updateOwnCampSchema),
  campController.updateCampById
);

router.put(
  "/owner/my-camp",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(updateCampSchema),
  campController.updateMyCamp
);



router.get("/", campController.getAllCamps);
router.get("/:id", campController.getCampById);

module.exports = router;