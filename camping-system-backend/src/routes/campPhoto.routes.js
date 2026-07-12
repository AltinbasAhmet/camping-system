const express = require("express");
const campPhotoController = require("../controllers/campPhoto.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const uploadCampPhotoFile = require("../middlewares/upload.middleware");
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

// Gerçek dosya yükleme (JPEG/PNG, multipart/form-data, alan adı: "photo").
router.post(
  "/:campId/photos/upload",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  uploadCampPhotoFile.single("photo"),
  campPhotoController.uploadCampPhoto
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