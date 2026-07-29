const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function createCampEvent(userId, userRole, data) {
  const camp = await prisma.camp.findUnique({
    where: {
      id: data.campId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  // A camp owner can only create an event for their own campsite; campers
  // (USER) can organize an event at any active campsite.
  if (userRole === "CAMP_OWNER" && camp.ownerId !== userId) {
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
      organizerId: userId,
      title: data.title,
      description: data.description,
      dateTime: eventDate,
      capacity: data.capacity,
      price: data.price
    },
    include: {
      camp: true,
      organizer: {
        select: { id: true, name: true, email: true, phone: true, role: true }
      }
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
      bookings: true,
      organizer: {
        select: { id: true, name: true, role: true }
      }
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
      bookings: true,
      organizer: {
        select: { id: true, name: true, role: true }
      }
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

// Permission to edit/delete an event belongs to the person who created it
// (organizerId), not the campsite owner — a camp owner edits their own
// event this way too, as does a camper for the event they created.
async function updateCampEvent(userId, eventId, data) {
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

  if (event.organizerId !== userId) {
    throw new AppError("You can only update events you organized", 403);
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
      camp: true,
      organizer: {
        select: { id: true, name: true, role: true }
      }
    }
  });
}

async function deleteCampEvent(userId, eventId) {
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

  if (event.organizerId !== userId) {
    throw new AppError("You can only delete events you organized", 403);
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

// Item 3: used for a separate section where both camp owners and campers
// can see the events they created themselves.
async function getMyOrganizedEvents(userId) {
  return prisma.campEvent.findMany({
    where: {
      organizerId: userId
    },
    include: {
      camp: true,
      bookings: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } }
        }
      }
    },
    orderBy: {
      dateTime: "desc"
    }
  }).then((events) =>
    events.map((event) => {
      const ticketsSold = event.bookings.reduce((sum, booking) => sum + booking.guestCount, 0);
      return {
        ...event,
        ticketsSold,
        remainingCapacity: event.capacity - ticketsSold
      };
    })
  );
}

module.exports = {
  createCampEvent,
  getEventsByCamp,
  getCampEventById,
  updateCampEvent,
  deleteCampEvent,
  getMyOrganizedEvents
};