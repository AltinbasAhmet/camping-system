const express = require("express");
const checkinController = require("../controllers/checkin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  searchByPlateSchema,
  searchByCodeSchema
} = require("../validators/checkin.validator");

const router = express.Router();

router.post(
  "/search-by-plate",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(searchByPlateSchema),
  checkinController.searchByPlate
);

router.post(
  "/:reservationId/confirm",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  checkinController.confirmCheckIn
);

router.post(
  "/:reservationId/checkout",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  checkinController.confirmCheckOut
);

router.post(
  "/search-by-code",
  authMiddleware,
  roleMiddleware("CAMP_OWNER"),
  validate(searchByCodeSchema),
  checkinController.searchByCode
);

module.exports = router;