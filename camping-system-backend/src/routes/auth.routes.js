const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;