const campService = require("../services/camp.service");

async function getAllCamps(req, res, next) {
  try {
    const result = await campService.getAllCamps(req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

async function getCampById(req, res, next) {
  try {
    const camp = await campService.getCampById(req.params.id);

    res.status(200).json({
      success: true,
      data: camp
    });
  } catch (error) {
    next(error);
  }
}
async function getMyCamps(req, res, next) {
  try {
    const camps = await campService.getMyCamps(req.user.id);

    res.status(200).json({
      success: true,
      data: camps
    });
  } catch (error) {
    next(error);
  }
}

async function createCampByAdmin(req, res, next) {
  try {
    const camp = await campService.createCampByAdmin(req.body);

    res.status(201).json({
      success: true,
      message: "Camp created successfully",
      data: camp
    });
  } catch (error) {
    next(error);
  }
}
async function createCampByOwner(req, res, next) {
  try {
    const camp = await campService.createCampByOwner(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Camp created successfully",
      data: camp
    });
  } catch (error) {
    next(error);
  }
}

async function getMyCamp(req, res, next) {
  try {
    const camp = await campService.getMyCamp(req.user.id);

    res.status(200).json({
      success: true,
      data: camp
    });
  } catch (error) {
    next(error);
  }
}

async function updateMyCamp(req, res, next) {
  try {
    const camp = await campService.updateMyCamp(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "Camp updated successfully",
      data: camp
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCamps,
  getCampById,
  createCampByAdmin,
  createCampByOwner,
  getMyCamp,
  getMyCamps,
  updateMyCamp
};