const adminService = require("../services/admin.service");

function wrap(serviceCall) {
  return async (req, res, next) => {
    try {
      const result = await serviceCall(req);
      res.status(200).json({ success: true, ...(result.data !== undefined ? result : { data: result }) });
    } catch (error) {
      next(error);
    }
  };
}

const getDashboardStats = wrap((req) => adminService.getDashboardStats());

const getAllUsers = wrap((req) => adminService.getAllUsers(req.query));
const getUserById = wrap((req) => adminService.getUserById(req.params.id));
const getAllStaff = wrap(() => adminService.getAllStaff());
const getCampStaff = wrap((req) => adminService.getCampStaff(req.params.id));

async function createStaff(req, res, next) {
  try {
    const staff = await adminService.createStaff(req.body);
    res.status(201).json({ success: true, message: "Personel hesabı oluşturuldu", data: staff });
  } catch (error) {
    next(error);
  }
}

async function assignStaffToCamp(req, res, next) {
  try {
    const assignment = await adminService.assignStaffToCamp(req.params.id, req.body.userId);
    res.status(201).json({ success: true, message: "Personel kampa atandı", data: assignment });
  } catch (error) {
    next(error);
  }
}

async function removeStaffFromCamp(req, res, next) {
  try {
    const result = await adminService.removeStaffFromCamp(req.params.id, req.params.userId);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, message: "User role updated successfully", data: user });
  } catch (error) {
    next(error);
  }
}

async function updateUserVerification(req, res, next) {
  try {
    const user = await adminService.updateUserVerification(req.params.id, req.body.verificationStatus);
    res.status(200).json({ success: true, message: "Verification status updated successfully", data: user });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

const getAllCamps = wrap((req) => adminService.getAllCampsForAdmin(req.query));
const getCampById = wrap((req) => adminService.getCampByIdForAdmin(req.params.id));

async function updateCamp(req, res, next) {
  try {
    const camp = await adminService.updateCampByAdmin(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Camp updated successfully", data: camp });
  } catch (error) {
    next(error);
  }
}

async function deleteCamp(req, res, next) {
  try {
    const result = await adminService.deleteCampByAdmin(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

const getAllReservations = wrap((req) => adminService.getAllReservationsForAdmin(req.query));

async function updateReservationStatus(req, res, next) {
  try {
    const reservation = await adminService.updateReservationStatusByAdmin(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Reservation status updated successfully", data: reservation });
  } catch (error) {
    next(error);
  }
}

const getAllCampEvents = wrap((req) => adminService.getAllCampEventsForAdmin(req.query));

async function deleteCampEvent(req, res, next) {
  try {
    const result = await adminService.deleteCampEventByAdmin(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

const getAllEventBookings = wrap((req) => adminService.getAllEventBookingsForAdmin(req.query));

async function deleteEventBooking(req, res, next) {
  try {
    const result = await adminService.deleteEventBookingByAdmin(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

async function runReminders(req, res, next) {
  try {
    const result = await adminService.runReminders();
    res.status(200).json({
      success: true,
      message: `${result.checkInCount} check-in, ${result.checkOutCount} check-out hatırlatması gönderildi`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createStaff,
  getAllStaff,
  getCampStaff,
  assignStaffToCamp,
  removeStaffFromCamp,
  updateUserRole,
  updateUserVerification,
  deleteUser,
  getAllCamps,
  getCampById,
  updateCamp,
  deleteCamp,
  getAllReservations,
  updateReservationStatus,
  getAllCampEvents,
  deleteCampEvent,
  getAllEventBookings,
  deleteEventBooking,
  runReminders
};
