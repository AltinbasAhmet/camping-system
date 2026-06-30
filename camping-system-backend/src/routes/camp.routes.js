const express = require("express");
const campController = require("../controllers/camp.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createCampSchema,
  updateCampSchema
} = require("../validators/camp.validator");

const router = express.Router();

router.post(
  "/admin/create",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  validate(createCampSchema),
  campController.createCampByAdmin
);

router.post(
  "/owner/create",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(createCampSchema.omit({ ownerId: true })),
  campController.createCampByOwner
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

router.put(
  "/owner/my-camp",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(updateCampSchema),
  campController.updateMyCamp
);

router.put(
  "/owner/:campId",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(updateCampSchema),
  campController.updateOwnerCamp
);


router.get("/", campController.getAllCamps);
router.get("/:id", campController.getCampById);

module.exports = router;