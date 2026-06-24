const eventService = require("../services/event.service");

exports.createEvent = async (req, res, next) => {
  try {
    const organiserId = req.user.id;

    const event = await eventService.createEvent(req.body, organiserId);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const result = await eventService.getAllEvents(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const organiserId = req.user.id;

    const updatedEvent = await eventService.updateEvent(
      req.params.id,
      req.body,
      organiserId
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const organiserId = req.user.id;

    const result = await eventService.deleteEvent(req.params.id, organiserId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrganiserDashboard = async (req, res, next) => {
  try {
    const organiserId = req.user.id;

    const dashboard = await eventService.getOrganiserDashboard(organiserId);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};