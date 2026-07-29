const { ZodError } = require("zod");
const multer = require("multer");
module.exports = (err, req, res, next) => {
  if (err instanceof ZodError) return res.status(400).json({ success: false, message: "Validation error", errors: (err.issues || []).map((e) => ({ field: e.path.join("."), message: e.message })) });
  if (err instanceof multer.MulterError || /JPEG|PNG|file/i.test(err.message || "")) return res.status(400).json({ success: false, message: err.message || "File could not be uploaded" });
  const statusCode = Number(err.statusCode) || 500;
  if (statusCode >= 500) console.error(`[${req.requestId || "no-request-id"}]`, err);
  const safeMessage = statusCode >= 500 && process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : (err.message || "Internal Server Error");
  res.status(statusCode).json({ success: false, message: safeMessage, requestId: req.requestId });
};
