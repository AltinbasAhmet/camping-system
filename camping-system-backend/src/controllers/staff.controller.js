const staffService = require("../services/staff.service");

async function getAssignedCamps(req, res, next) {
  try {
    const camps = await staffService.getAssignedCamps(req.user.id);
    res.status(200).json({ success: true, data: camps });
  } catch (error) {
    next(error);
  }
}

async function getReservations(req, res, next) {
  try {
    const reservations = await staffService.getReservations(req.user.id, req.query);
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAssignedCamps, getReservations };
