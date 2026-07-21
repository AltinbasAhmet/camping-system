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


async function cancelMyReservation(req, res, next) {
  try {
    const result = await reservationService.cancelMyReservation(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: result.message,
      lateCancellation: result.lateCancellation,
      data: result.reservation
    });
  } catch (error) {
    next(error);
  }
}

async function approveReservation(req, res, next) {
  try {
    const reservation = await reservationService.respondToReservation(
      req.user.id,
      req.params.id,
      "approve"
    );

    res.status(200).json({
      success: true,
      message: "Reservation approved successfully",
      data: reservation
    });
  } catch (error) {
    next(error);
  }
}

async function rejectReservation(req, res, next) {
  try {
    const reservation = await reservationService.respondToReservation(
      req.user.id,
      req.params.id,
      "reject"
    );

    res.status(200).json({
      success: true,
      message: "Reservation rejected successfully",
      data: reservation
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnerReservations(req, res, next) {
  try {
    const reservations = await reservationService.getOwnerReservations(
      req.user.id,
      req.query.campId
    );

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
  approveReservation,
  rejectReservation,
  getMyReservations,
  cancelMyReservation,
  getOwnerReservations
};