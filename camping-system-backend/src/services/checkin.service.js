const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function searchReservationByPlate(ownerId, plateNumber) {
  const reservations = await prisma.campReservation.findMany({
    where: {
      plateNumber: plateNumber.trim().toUpperCase(),
      camp: {
        ownerId
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
    orderBy: [
      {
        checkInDate: "asc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  if (reservations.length === 0) {
    throw new AppError("No reservations found for this plate", 404);
  }

  return reservations;
}

async function confirmCheckIn(ownerId, reservationId) {
  const reservation = await prisma.campReservation.findUnique({
    where: {
      id: Number(reservationId)
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
    }
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (reservation.camp.ownerId !== ownerId) {
    throw new AppError("You can only check-in your own camp reservations", 403);
  }

  if (reservation.status !== "CONFIRMED") {
    throw new AppError("Only confirmed reservations can be checked in", 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(reservation.checkInDate);
  checkInDate.setHours(0, 0, 0, 0);

  const checkOutDate = new Date(reservation.checkOutDate);
  checkOutDate.setHours(0, 0, 0, 0);

  if (today < checkInDate) {
    throw new AppError(
      "Check-in cannot be completed before the reservation start date",
      400
    );
  }

  if (today > checkOutDate) {
    throw new AppError(
      "Check-in cannot be completed after the reservation end date",
      400
    );
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      guests: true
    }
  });
}

async function searchReservationByCode(ownerId, reservationCode) {
  const reservation = await prisma.campReservation.findFirst({
    where: {
      reservationCode: reservationCode.trim().toUpperCase(),
      camp: {
        ownerId
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
    }
  });

  if (!reservation) {
    throw new AppError("Reservation not found for this code", 404);
  }

  return reservation;
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
  searchReservationByCode,
  confirmCheckIn,
  confirmCheckOut
};