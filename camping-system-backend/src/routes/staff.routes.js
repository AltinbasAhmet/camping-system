const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const staffController = require("../controllers/staff.controller");

const router = express.Router();
router.use(authMiddleware, roleMiddleware("STAFF"));
router.get("/camps", staffController.getAssignedCamps);
router.get("/reservations", staffController.getReservations);

module.exports = router;
