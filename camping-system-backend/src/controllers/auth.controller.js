const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const { user, token, pendingApproval } = await authService.register(req.body, req.file);

    res.status(201).json({
      success: true,
      message: pendingApproval
        ? "Kayıt alındı. Kamp sahibi hesabınız sistem yöneticisi onayı bekliyor."
        : "User registered successfully",
      pendingApproval,
      token,
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
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
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