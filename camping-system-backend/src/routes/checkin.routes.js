const express = require("express");
const checkinController = require("../controllers/checkin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  searchReservationSchema
} = require("../validators/checkin.validator");

const router = express.Router();

router.post(
  "/search-by-plate",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "STAFF", "SYSTEM_ADMIN"),
  validate(searchReservationSchema),
  checkinController.searchByPlate
);

router.post(
  "/:reservationId/confirm",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "STAFF", "SYSTEM_ADMIN"),
  checkinController.confirmCheckIn
);

router.post(
  "/:reservationId/checkout",
  authMiddleware,
  roleMiddleware("CAMP_OWNER", "STAFF", "SYSTEM_ADMIN"),
  checkinController.confirmCheckOut
);

module.exports = router;
