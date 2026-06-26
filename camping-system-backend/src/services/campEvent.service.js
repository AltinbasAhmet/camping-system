const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function createCampEvent(ownerId, data) {
  const camp = await prisma.camp.findUnique({
    where: {
      id: data.campId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  if (camp.ownerId !== ownerId) {
    throw new AppError("You can only create events for your own camp", 403);
  }

  if (camp.status !== "ACTIVE") {
    throw new AppError("You can only create events for active camps", 400);
  }

  const eventDate = new Date(data.dateTime);

  if (Number.isNaN(eventDate.getTime())) {
    throw new AppError("Invalid event date", 400);
  }

  if (eventDate <= new Date()) {
    throw new AppError("Event date must be in the future", 400);
  }

  const event = await prisma.campEvent.create({
    data: {
      campId: data.campId,
      title: data.title,
      description: data.description,
      dateTime: eventDate,
      capacity: data.capacity,
      price: data.price
    },
    include: {
      camp: true
    }
  });

  return event;
}

async function getEventsByCamp(campId) {
  const camp = await prisma.camp.findUnique({
    where: {
      id: Number(campId)
    }
  });

  if (!camp || camp.status !== "ACTIVE") {
    throw new AppError("Camp not found", 404);
  }

  return prisma.campEvent.findMany({
    where: {
      campId: Number(campId)
    },
    include: {
      camp: true,
      bookings: true
    },
    orderBy: {
      dateTime: "asc"
    }
  });
}

async function getCampEventById(id) {
  const event = await prisma.campEvent.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      camp: true,
      bookings: true
    }
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const ticketsSold = event.bookings.reduce((sum, booking) => {
    return sum + booking.guestCount;
  }, 0);

  return {
    ...event,
    ticketsSold,
    remainingCapacity: event.capacity - ticketsSold
  };
}

async function updateCampEvent(ownerId, eventId, data) {
  const event = await prisma.campEvent.findUnique({
    where: {
      id: Number(eventId)
    },
    include: {
      camp: true,
      bookings: true
    }
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.camp.ownerId !== ownerId) {
    throw new AppError("You can only update your own camp events", 403);
  }

  const ticketsSold = event.bookings.reduce((sum, booking) => {
    return sum + booking.guestCount;
  }, 0);

  if (data.capacity && data.capacity < ticketsSold) {
    throw new AppError("Capacity cannot be lower than existing bookings", 400);
  }

  const updateData = { ...data };

  if (data.dateTime) {
    const eventDate = new Date(data.dateTime);

    if (Number.isNaN(eventDate.getTime())) {
      throw new AppError("Invalid event date", 400);
    }

    if (eventDate <= new Date()) {
      throw new AppError("Event date must be in the future", 400);
    }

    updateData.dateTime = eventDate;
  }

  return prisma.campEvent.update({
    where: {
      id: Number(eventId)
    },
    data: updateData,
    include: {
      camp: true
    }
  });
}

async function deleteCampEvent(ownerId, eventId) {
  const event = await prisma.campEvent.findUnique({
    where: {
      id: Number(eventId)
    },
    include: {
      camp: true,
      bookings: true
    }
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.camp.ownerId !== ownerId) {
    throw new AppError("You can only delete your own camp events", 403);
  }

  if (event.bookings.length > 0) {
    throw new AppError("Cannot delete event with existing bookings", 400);
  }

  await prisma.campEvent.delete({
    where: {
      id: Number(eventId)
    }
  });

  return true;
}

module.exports = {
  createCampEvent,
  getEventsByCamp,
  getCampEventById,
  updateCampEvent,
  deleteCampEvent
};