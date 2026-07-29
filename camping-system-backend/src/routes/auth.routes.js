const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const uploadCampPhoto = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const { rateLimit } = require("../middlewares/security.middleware");
const { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validators/auth.validator");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: "Too many login attempts. Please try again later." });
const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 8, message: "Too many verification attempts. Please try again later." });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 3, message: "Too many password reset requests. Please try again later." });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, message: "Too many registrations from this address." });

router.post("/register", registerLimiter, uploadCampPhoto.single("campPhoto"), validate(registerSchema), authController.register);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post("/forgot-password", resetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", resetLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get("/me", auth, authController.me);
router.post("/logout", authController.logout);
module.exports = router;
