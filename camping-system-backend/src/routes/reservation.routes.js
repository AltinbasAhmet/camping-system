const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createReservationSchema
} = require("../validators/reservation.validator");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("USER"),
  validate(createReservationSchema),
  reservationController.createReservation
);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("USER"),
  reservationController.getMyReservations
);

router.get(
  "/owner",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  reservationController.getOwnerReservations
);

module.exports = router;