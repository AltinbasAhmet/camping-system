const express = require("express");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { createOwnerSchema } = require("../validators/admin.validator");

const router = express.Router();

router.post(
  "/owners",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  validate(createOwnerSchema),
  adminController.createCampOwner
);

router.get(
  "/owners",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  adminController.getCampOwners
);

module.exports = router;