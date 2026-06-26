const express = require("express");
const campPhotoController = require("../controllers/campPhoto.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createCampPhotoSchema
} = require("../validators/campPhoto.validator");

const router = express.Router();

router.post(
  "/:campId/photos",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(createCampPhotoSchema),
  campPhotoController.addCampPhoto
);

router.get(
  "/:campId/photos",
  campPhotoController.getCampPhotos
);

router.delete(
  "/photos/:photoId",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  campPhotoController.deleteCampPhoto
);

module.exports = router;