const express = require("express");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  updateUserRoleSchema,
  updateUserVerificationSchema,
  updateCampByAdminSchema,
  updateReservationStatusSchema,
  createStaffSchema,
  assignStaffSchema
} = require("../validators/admin.validator");

const router = express.Router();

// Every endpoint in this router can only be used by a SYSTEM_ADMIN.
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

router.post("/staff", validate(createStaffSchema), adminController.createStaff);
router.get("/staff", adminController.getAllStaff);

router.get("/camps", adminController.getAllCamps);
router.get("/camps/:id/staff", adminController.getCampStaff);
router.post("/camps/:id/staff", validate(assignStaffSchema), adminController.assignStaffToCamp);
router.delete("/camps/:id/staff/:userId", adminController.removeStaffFromCamp);
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

// For test/demo purposes: manually triggers the daily reminder job.
router.post("/reminders/run", adminController.runReminders);

module.exports = router;
