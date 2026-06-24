const checkinService = require("../services/checkin.service");

async function searchByPlate(req, res, next) {
  try {
    const reservation = await checkinService.searchReservationByPlate(
      req.user.id,
      req.body.plateNumber
    );

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
}

async function confirmCheckIn(req, res, next) {
  try {
    const reservation = await checkinService.confirmCheckIn(
      req.user.id,
      req.params.reservationId
    );

    res.status(200).json({
      success: true,
      message: "Check-in completed successfully",
      data: reservation
    });
  } catch (error) {
    next(error);
  }
}

async function confirmCheckOut(req, res, next) {
  try {
    const reservation = await checkinService.confirmCheckOut(
      req.user.id,
      req.params.reservationId
    );

    res.status(200).json({
      success: true,
      message: "Check-out completed successfully",
      data: reservation
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchByPlate,
  confirmCheckIn,
  confirmCheckOut
};