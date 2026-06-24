const reservationService = require("../services/reservation.service");

async function createReservation(req, res, next) {
  try {
    const reservation = await reservationService.createReservation(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation
    });
  } catch (error) {
    next(error);
  }
}

async function getMyReservations(req, res, next) {
  try {
    const reservations = await reservationService.getMyReservations(req.user.id);

    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnerReservations(req, res, next) {
  try {
    const reservations = await reservationService.getOwnerReservations(req.user.id);

    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReservation,
  getMyReservations,
  getOwnerReservations
};