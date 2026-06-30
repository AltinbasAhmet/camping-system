const adminService = require("../services/admin.service");

async function createCampOwner(req, res, next) {
  try {
    const owner = await adminService.createCampOwner(req.body);

    res.status(201).json({
      success: true,
      message: "Camp owner created successfully",
      data: owner
    });
  } catch (error) {
    next(error);
  }
}

async function getCampOwners(req, res, next) {
  try {
    const owners = await adminService.getCampOwners();

    res.status(200).json({
      success: true,
      data: owners
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCampOwner,
  getCampOwners
};