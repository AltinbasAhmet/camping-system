const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const uploadCampPhoto = require("../middlewares/upload.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

// Kamp sahibi başvurusunda kamp fotoğrafı da yüklenebilir (opsiyonel,
// alan adı: "campPhoto"). multipart/form-data kullanılmazsa (ör. sıradan
// kullanıcı kaydı JSON ile gelirse) multer sorunsuzca req.body'i doldurur.
router.post(
  "/register",
  uploadCampPhoto.single("campPhoto"),
  validate(registerSchema),
  authController.register
);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;