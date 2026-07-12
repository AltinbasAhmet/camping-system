const express = require("express");
const eventBookingController = require("../controllers/eventBooking.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createEventBookingSchema
} = require("../validators/eventBooking.validator");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("USER"),
  validate(createEventBookingSchema),
  eventBookingController.createEventBooking
);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("USER"),
  eventBookingController.getMyEventBookings
);

router.get(
  "/owner",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  eventBookingController.getOwnerEventBookings
);

module.exports = router;