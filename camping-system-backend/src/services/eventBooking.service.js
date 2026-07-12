const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const notificationService = require("./notification.service");

async function createEventBooking(userId, data) {
  const event = await prisma.campEvent.findUnique({
    where: {
      id: data.eventId
    },
    include: {
      bookings: true,
      camp: true
    }
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.camp.status !== "ACTIVE") {
    throw new AppError("Camp is not active", 400);
  }

  if (event.dateTime <= new Date()) {
    throw new AppError("Cannot book a past event", 400);
  }

  const existingBooking = await prisma.eventBooking.findUnique({
    where: {
      eventId_userId: {
        eventId: data.eventId,
        userId
      }
    }
  });

  if (existingBooking) {
    throw new AppError("You have already booked this event", 400);
  }

  const ticketsSold = event.bookings.reduce((sum, booking) => {
    return sum + booking.guestCount;
  }, 0);

  const remainingCapacity = event.capacity - ticketsSold;

  if (data.guestCount > remainingCapacity) {
    throw new AppError("Not enough capacity for this event", 400);
  }

  const booking = await prisma.eventBooking.create({
    data: {
      eventId: data.eventId,
      userId,
      guestCount: data.guestCount
    },
    include: {
      event: {
        include: {
          camp: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  notificationService.notifyUserEventTicketPurchased(booking);

  return booking;
}

async function getMyEventBookings(userId) {
  return prisma.eventBooking.findMany({
    where: {
      userId
    },
    include: {
      event: {
        include: {
          camp: true
        }
      }
    },
    orderBy: {
      bookedAt: "desc"
    }
  });
}

async function getOwnerEventBookings(ownerId, campId) {
  const camps = await prisma.camp.findMany({
    where: {
      ownerId
    },
    select: {
      id: true
    }
  });

  const campIds = camps.map((camp) => camp.id);

  if (campIds.length === 0) {
    throw new AppError("Camp not found for this owner", 404);
  }

  let filteredCampIds = campIds;

  if (campId) {
    const numericCampId = Number(campId);

    if (!campIds.includes(numericCampId)) {
      throw new AppError("You can only view event bookings for your own camps", 403);
    }

    filteredCampIds = [numericCampId];
  }

  return prisma.eventBooking.findMany({
    where: {
      event: {
        campId: {
          in: filteredCampIds
        }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      event: {
        include: {
          camp: true
        }
      }
    },
    orderBy: {
      bookedAt: "desc"
    }
  });
}

module.exports = {
  createEventBooking,
  getMyEventBookings,
  getOwnerEventBookings
};