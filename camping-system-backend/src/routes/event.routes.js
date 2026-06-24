const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createEventSchema,
  updateEventSchema,
} = require("../validators/event.validator");

// public routes
router.get("/", eventController.getAllEvents);

// dashboard route önce gelmeli
router.get(
  "/dashboard/organiser",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  eventController.getOrganiserDashboard
);

// protected organiser routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  validate(createEventSchema),
  eventController.createEvent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  eventController.deleteEvent
);

// public single event route en sona
router.get("/:id", eventController.getEventById);

module.exports = router;