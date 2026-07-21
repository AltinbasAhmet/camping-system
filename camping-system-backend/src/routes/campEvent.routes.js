const express = require("express");
const campEventController = require("../controllers/campEvent.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const eventPhotoController = require("../controllers/eventPhoto.controller");
const uploadEventPhoto = require("../middlewares/eventUpload.middleware");
const {
  createCampEventSchema,
  updateCampEventSchema
} = require("../validators/campEvent.validator");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "USER"),
  validate(createCampEventSchema),
  campEventController.createCampEvent
);

router.post(
  "/:eventId/photos/upload",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "USER"),
  uploadEventPhoto.single("photo"),
  eventPhotoController.uploadEventPhoto
);

router.get("/:eventId/photos", eventPhotoController.getEventPhotos);

router.delete(
  "/photos/:photoId",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "USER"),
  eventPhotoController.deleteEventPhoto
);

// /me, /:id'den önce tanımlanmalı ki "me" bir id gibi yorumlanmasın.
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "USER"),
  campEventController.getMyEvents
);

router.get(
  "/camp/:campId",
  campEventController.getEventsByCamp
);

router.get(
  "/:id",
  campEventController.getCampEventById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "USER"),
  validate(updateCampEventSchema),
  campEventController.updateCampEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "USER"),
  campEventController.deleteCampEvent
);

module.exports = router;