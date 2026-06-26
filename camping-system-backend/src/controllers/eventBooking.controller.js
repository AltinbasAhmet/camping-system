const eventBookingService = require("../services/eventBooking.service");

async function createEventBooking(req, res, next) {
  try {
    const booking = await eventBookingService.createEventBooking(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Event booking created successfully",
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

async function getMyEventBookings(req, res, next) {
  try {
    const bookings = await eventBookingService.getMyEventBookings(req.user.id);

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnerEventBookings(req, res, next) {
  try {
    const bookings = await eventBookingService.getOwnerEventBookings(
      req.user.id,
      req.query.campId
    );

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEventBooking,
  getMyEventBookings,
  getOwnerEventBookings
};