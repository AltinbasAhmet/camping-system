const express = require("express");
const campEventController = require("../controllers/campEvent.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createCampEventSchema,
  updateCampEventSchema
} = require("../validators/campEvent.validator");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(createCampEventSchema),
  campEventController.createCampEvent
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
  roleMiddleware("CAMP_OWNER"),
  validate(updateCampEventSchema),
  campEventController.updateCampEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  campEventController.deleteCampEvent
);

module.exports = router;