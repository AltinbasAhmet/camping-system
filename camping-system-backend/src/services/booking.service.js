const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

exports.createBooking = async (userId, eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    include: {
      bookings: true,
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.bookings.length >= event.capacity) {
    throw new AppError("Event is fully booked", 400);
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      userId,
      eventId: Number(eventId),
    },
  });

  if (existingBooking) {
    throw new AppError("You have already booked this event", 400);
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      eventId: Number(eventId),
    },
    include: {
      event: true,
    },
  });

  return booking;
};

exports.getMyBookings = async (userId) => {
  return await prisma.booking.findMany({
    where: {
      userId: Number(userId),
    },
    include: {
      event: {
        include: {
          organiser: {
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
      bookedAt: "desc",
    },
  });
};