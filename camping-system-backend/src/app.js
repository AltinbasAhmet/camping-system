const express = require("express");
const cors = require("cors");
const path = require("path");
const campRoutes = require("./routes/camp.routes");
const reservationRoutes = require("./routes/reservation.routes");
const checkinRoutes = require("./routes/checkin.routes");
const campEventRoutes = require("./routes/campEvent.routes");
const eventBookingRoutes = require("./routes/eventBooking.routes");
const campPhotoRoutes = require("./routes/campPhoto.routes");
const campCommentRoutes = require("./routes/campComment.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const staffRoutes = require("./routes/staff.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const { securityHeaders, requestId } = require("./middlewares/security.middleware");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(requestId);
app.use(securityHeaders);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy does not allow this origin"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads"), {
  dotfiles: "deny",
  fallthrough: false,
  immutable: true,
  maxAge: "7d",
  setHeaders(res) { res.setHeader("X-Content-Type-Options", "nosniff"); }
}));

app.get("/", (req, res) => res.status(200).json({ message: "API is running" }));
app.use("/auth", authRoutes);
app.use("/camps", campPhotoRoutes);
app.use("/camps", campCommentRoutes);
app.use("/camps", campRoutes);
app.use("/reservations", reservationRoutes);
app.use("/checkin", checkinRoutes);
app.use("/camp-events", campEventRoutes);
app.use("/event-bookings", eventBookingRoutes);
app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint not found" }));
app.use(errorMiddleware);
module.exports = app;
