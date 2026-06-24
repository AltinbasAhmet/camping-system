const express = require("express");
const cors = require("cors");
const campRoutes = require("./routes/camp.routes");
const reservationRoutes = require("./routes/reservation.routes");
const checkinRoutes = require("./routes/checkin.routes");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const bookingRoutes = require("./routes/booking.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/camps", campRoutes);
app.use("/reservations", reservationRoutes);
app.use("/checkin", checkinRoutes);
app.use(errorMiddleware);

module.exports = app;