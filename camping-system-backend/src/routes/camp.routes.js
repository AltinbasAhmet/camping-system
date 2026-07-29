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

// Minimal admin approval endpoint: a full admin panel is planned as a
// separate work item; this is just the smallest piece needed to move an
// owner's PENDING campsites to ACTIVE.
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

// A camp owner adds their own campsite (new). The campsite is created as
// PENDING and appears in the public listing after admin approval.
router.post(
  "/owner/my-camps",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(createOwnCampSchema),
  campController.createMyCamp
);

// ID-based update for owners who have more than one campsite.
router.put(
  "/owner/my-camps/:id",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(updateOwnCampSchema),
  campController.updateCampById
);


router.delete(
  "/owner/my-camps/:id",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  campController.deleteCampById
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