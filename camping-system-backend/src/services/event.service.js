const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

exports.createEvent = async (data, organiserId) => {
  const { title, description, dateTime, capacity } = data;

  const eventDate = new Date(dateTime);

  if (Number.isNaN(eventDate.getTime())) {
    throw new AppError("Invalid event date/time", 400);
  }

  if (eventDate <= new Date()) {
    throw new AppError("Event date must be in the future", 400);
  }

  const parsedCapacity = Number(capacity);

  if (!parsedCapacity || parsedCapacity < 1) {
    throw new AppError("Capacity must be at least 1", 400);
  }

  if (!organiserId) {
    throw new AppError("Organiser ID is missing", 401);
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      dateTime: eventDate,
      capacity: parsedCapacity,
      organiser: {
        connect: {
          id: organiserId,
        },
      },
    },
  });

  return event;
};

exports.getAllEvents = async (query) => {
  const search = query.search || "";
  const capacity = query.capacity ? Number(query.capacity) : undefined;

  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 5;
  const skip = (page - 1) * limit;

  if (page < 1 || limit < 1) {
    throw new AppError("Page and limit must be greater than 0", 400);
  }

  const where = {};

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
        },
      },
      {
        description: {
          contains: search,
        },
      },
    ];
  }

  if (capacity) {
    where.capacity = {
      gte: capacity,
    };
  }

  const total = await prisma.event.count({
    where,
  });

  const events = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    include: {
      organiser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      dateTime: query.sort =="desc"?"desc":"asc",
    },
  });

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: events.map((event) => ({
    ...event,
    ticketsSold: event._count.bookings,
    remainingCapacity: event.capacity - event._count.bookings,})),
    
  };
};

exports.getEventById = async (eventId) => {
  const id = Number(eventId);

  if (!id) {
    throw new AppError("Invalid event ID", 400);
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organiser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      bookings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return {
    ...event,
    ticketsSold: event._count.bookings,
    remainingCapacity: event.capacity - event._count.bookings,
  };
};

exports.updateEvent = async (eventId, data, organiserId) => {
  const id = Number(eventId);

  if (!id) {
    throw new AppError("Invalid event ID", 400);
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!existingEvent) {
    throw new AppError("Event not found", 404);
  }

  if (existingEvent.organiserId !== organiserId) {
    throw new AppError("You are not authorised to update this event", 403);
  }

  const updateData = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;

  if (data.dateTime !== undefined) {
    const newDate = new Date(data.dateTime);

    if (Number.isNaN(newDate.getTime())) {
      throw new AppError("Invalid event date/time", 400);
    }

    if (newDate <= new Date()) {
      throw new AppError("Event date must be in the future", 400);
    }

    updateData.dateTime = newDate;
  }

  if (data.capacity !== undefined) {
    const newCapacity = Number(data.capacity);

    if (!newCapacity || newCapacity < 1) {
      throw new AppError("Capacity must be at least 1", 400);
    }

    if (newCapacity < existingEvent._count.bookings) {
      throw new AppError(
        "Capacity cannot be smaller than the number of already booked tickets",
        400
      );
    }

    updateData.capacity = newCapacity;
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  return updatedEvent;
};

exports.deleteEvent = async (eventId, organiserId) => {
  const id = Number(eventId);

  if (!id) {
    throw new AppError("Invalid event ID", 400);
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!existingEvent) {
    throw new AppError("Event not found", 404);
  }

  if (existingEvent.organiserId !== organiserId) {
    throw new AppError("You are not authorised to delete this event", 403);
  }

  if (existingEvent._count.bookings > 0) {
    throw new AppError(
      "This event already has bookings, so it cannot be deleted",
      400
    );
  }

  await prisma.event.delete({
    where: { id },
  });

  return { message: "Event deleted successfully" };
};

exports.getOrganiserDashboard = async (organiserId) => {
  if (!organiserId) {
    throw new AppError("Organiser ID is missing", 401);
  }

  const events = await prisma.event.findMany({
    where: {
      organiserId,
    },
    include: {
      bookings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      dateTime: "asc",
    },
  });

  const dashboard = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    dateTime: event.dateTime,
    capacity: event.capacity,
    ticketsSold: event.bookings.length,
    remainingCapacity: event.capacity - event.bookings.length,
    attendees: event.bookings.map((booking) => ({
      bookingId: booking.id,
      bookedAt: booking.bookedAt,
      attendee: booking.user,
    })),
  }));

  return dashboard;
};