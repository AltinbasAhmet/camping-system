const campEventService = require("../services/campEvent.service");

async function createCampEvent(req, res, next) {
  try {
    const event = await campEventService.createCampEvent(req.user.id, req.user.role, req.body);

    res.status(201).json({
      success: true,
      message: "Camp event created successfully",
      data: event
    });
  } catch (error) {
    next(error);
  }
}

async function getMyEvents(req, res, next) {
  try {
    const events = await campEventService.getMyOrganizedEvents(req.user.id);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
}

async function getEventsByCamp(req, res, next) {
  try {
    const events = await campEventService.getEventsByCamp(req.params.campId);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
}

async function getCampEventById(req, res, next) {
  try {
    const event = await campEventService.getCampEventById(req.params.id);

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
}

async function updateCampEvent(req, res, next) {
  try {
    const event = await campEventService.updateCampEvent(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Camp event updated successfully",
      data: event
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCampEvent(req, res, next) {
  try {
    await campEventService.deleteCampEvent(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: "Camp event deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCampEvent,
  getMyEvents,
  getEventsByCamp,
  getCampEventById,
  updateCampEvent,
  deleteCampEvent
};