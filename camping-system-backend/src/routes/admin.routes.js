const express = require("express");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  updateUserRoleSchema,
  updateUserVerificationSchema,
  updateCampByAdminSchema,
  updateReservationStatusSchema
} = require("../validators/admin.validator");

const router = express.Router();

// Bu router'daki her endpoint sadece SYSTEM_ADMIN tarafından kullanılabilir.
router.use(authMiddleware, roleMiddleware("SYSTEM_ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);
router.patch(
  "/users/:id/verification",
  validate(updateUserVerificationSchema),
  adminController.updateUserVerification
);
router.delete("/users/:id", adminController.deleteUser);

router.get("/camps", adminController.getAllCamps);
router.get("/camps/:id", adminController.getCampById);
router.patch("/camps/:id", validate(updateCampByAdminSchema), adminController.updateCamp);
router.delete("/camps/:id", adminController.deleteCamp);

router.get("/reservations", adminController.getAllReservations);
router.patch(
  "/reservations/:id/status",
  validate(updateReservationStatusSchema),
  adminController.updateReservationStatus
);

router.get("/camp-events", adminController.getAllCampEvents);
router.delete("/camp-events/:id", adminController.deleteCampEvent);

router.get("/event-bookings", adminController.getAllEventBookings);
router.delete("/event-bookings/:id", adminController.deleteEventBooking);

// Test/demo amaçlı: günlük hatırlatma görevini elle tetikler.
router.post("/reminders/run", adminController.runReminders);

module.exports = router;
