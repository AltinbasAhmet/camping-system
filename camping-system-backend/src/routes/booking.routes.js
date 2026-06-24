const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { createBookingSchema } = require("../validators/booking.validator");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  bookingController.getMyBookings
);

module.exports = router;