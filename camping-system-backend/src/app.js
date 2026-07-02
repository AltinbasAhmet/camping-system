const express = require("express");
const cors = require("cors");
const campRoutes = require("./routes/camp.routes");
const reservationRoutes = require("./routes/reservation.routes");
const checkinRoutes = require("./routes/checkin.routes");
const campEventRoutes = require("./routes/campEvent.routes");
const eventBookingRoutes = require("./routes/eventBooking.routes");
const campPhotoRoutes = require("./routes/campPhoto.routes");
const adminRoutes = require("./routes/admin.routes");

const authRoutes = require("./routes/auth.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/camps", campPhotoRoutes);
app.use("/camps", campRoutes);
app.use("/reservations", reservationRoutes);
app.use("/checkin", checkinRoutes);
app.use("/camp-events", campEventRoutes);
app.use("/event-bookings", eventBookingRoutes);


app.use(errorMiddleware);

module.exports = app;