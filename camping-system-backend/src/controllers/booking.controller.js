const bookingService = require("../services/booking.service");

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(
      req.user.id,
      req.body.eventId
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user.id);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};