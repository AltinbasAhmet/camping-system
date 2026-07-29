const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const item of header.split(";")) {
    const [key, ...parts] = item.trim().split("=");
    if (key === name) return decodeURIComponent(parts.join("="));
  }
  return null;
}

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearer = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = readCookie(req, "camppal_session") || bearer;
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) throw new Error("JWT_SECRET is not configured securely");
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "camppal-api", audience: "camppal-web" });

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.sub) },
      select: { id: true, name: true, email: true, phone: true, role: true, verificationStatus: true, isActive: true, tokenVersion: true }
    });
    if (!user || !user.isActive || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: "Session is no longer valid" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};
