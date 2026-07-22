const checkinService = require("../services/checkin.service");

async function searchByPlate(req, res, next) {
  try {
    const reservation = await checkinService.searchReservation(req.user, req.body);

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
      req.user,
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
      req.user,
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
