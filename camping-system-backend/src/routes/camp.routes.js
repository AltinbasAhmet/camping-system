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

router.get("/", campController.getAllCamps);
router.get("/:id", campController.getCampById);

router.post(
  "/admin/create",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  validate(createCampSchema),
  campController.createCampByAdmin
);

router.get(
  "/owner/my-camp",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  campController.getMyCamp
);

router.put(
  "/owner/my-camp",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(updateCampSchema),
  campController.updateMyCamp
);

module.exports = router;