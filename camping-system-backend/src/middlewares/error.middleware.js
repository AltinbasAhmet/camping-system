const { ZodError } = require("zod");
const multer = require("multer");

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: (err.issues || []).map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof multer.MulterError || /JPEG|PNG/.test(err.message || "")) {
    return res.status(400).json({
      success: false,
      message: err.message || "File could not be uploaded",
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorMiddleware;