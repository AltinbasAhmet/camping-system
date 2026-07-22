const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const { user, userId, otpRequired } = await authService.register(req.body, req.file);

    res.status(201).json({
      success: true,
      message: `Registration received. A verification code has been sent ${req.body.notificationChannel === "SMS" ? "to your phone via SMS" : "to your email address"}.`,
      otpRequired,
      userId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: result.message || "Verification code sent",
      otpRequired: result.otpRequired,
      purpose: result.purpose,
      userId: result.userId,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const result = await authService.verifyOtp(userId, code);

    if (result.pendingApproval) {
      return res.status(200).json({
        success: true,
        message: "Verification successful. Your camp owner account is awaiting system administrator approval.",
        pendingApproval: true,
        token: null,
        user: result.user,
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification successful",
      pendingApproval: false,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const result = await authService.resendOtp(req.body.userId, req.body.notificationChannel);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
