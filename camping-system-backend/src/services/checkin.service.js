const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function searchReservationByPlate(ownerId, plateNumber) {
  const camp = await prisma.camp.findFirst({
    where: {
      ownerId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found for this owner", 404);
  }

  const reservation = await prisma.campReservation.findFirst({
    where: {
      campId: camp.id,
      plateNumber: plateNumber.toUpperCase(),
      status: {
        in: ["CONFIRMED", "CHECKED_IN"]
      }
    },
    include: {
      camp: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      guests: true
    },
    orderBy: {
      checkInDate: "asc"
    }
  });

  if (!reservation) {
    throw new AppError("Reservation not found for this plate", 404);
  }

  return reservation;
}

async function confirmCheckIn(ownerId, reservationId) {
  const camp = await prisma.camp.findFirst({
    where: {
      ownerId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found for this owner", 404);
  }

  const reservation = await prisma.campReservation.findFirst({
    where: {
      id: Number(reservationId),
      campId: camp.id
    }
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (reservation.status !== "CONFIRMED") {
    throw new AppError("Only confirmed reservations can be checked in", 400);
  }

  return prisma.campReservation.update({
    where: {
      id: reservation.id
    },
    data: {
      status: "CHECKED_IN"
    },
    include: {
      camp: true,
      guests: true
    }
  });
}

async function confirmCheckOut(ownerId, reservationId) {
  const camp = await prisma.camp.findFirst({
    where: {
      ownerId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found for this owner", 404);
  }

  const reservation = await prisma.campReservation.findFirst({
    where: {
      id: Number(reservationId),
      campId: camp.id
    }
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (reservation.status !== "CHECKED_IN") {
    throw new AppError("Only checked-in reservations can be checked out", 400);
  }

  return prisma.campReservation.update({
    where: {
      id: reservation.id
    },
    data: {
      status: "CHECKED_OUT"
    },
    include: {
      camp: true,
      guests: true
    }
  });
}

module.exports = {
  searchReservationByPlate,
  confirmCheckIn,
  confirmCheckOut
};