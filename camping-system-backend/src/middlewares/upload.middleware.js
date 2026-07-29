const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const uploadDir = path.join(__dirname, "..", "..", "uploads", "camp-photos");
fs.mkdirSync(uploadDir, { recursive: true });
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png" };
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype] || ""}`)
});
const base = multer({ storage, fileFilter(req, file, cb) { return ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error("Only JPEG or PNG files can be uploaded")); }, limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 30 } });
function validMagic(filePath) {
  const fd = fs.openSync(filePath, "r"); const buf = Buffer.alloc(8); fs.readSync(fd, buf, 0, 8, 0); fs.closeSync(fd);
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf.equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  return jpeg || png;
}
function single(field) {
  const middleware = base.single(field);
  return (req, res, next) => middleware(req, res, (err) => {
    if (err) return next(err);
    if (req.file && !validMagic(req.file.path)) { fs.unlinkSync(req.file.path); req.file = undefined; return next(new Error("Uploaded file content is not a valid JPEG or PNG image")); }
    next();
  });
}
module.exports = { single };
