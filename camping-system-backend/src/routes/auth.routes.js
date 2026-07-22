const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const uploadCampPhoto = require("../middlewares/upload.middleware");
const { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validators/auth.validator");

// A campsite photo can also be uploaded with a camp owner application
// (optional, field name: "campPhoto"). If multipart/form-data isn't used
// (e.g. a regular user registration sent as JSON), multer fills req.body
// without any issues.
router.post(
  "/register",
  uploadCampPhoto.single("campPhoto"),
  validate(registerSchema),
  authController.register
);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
