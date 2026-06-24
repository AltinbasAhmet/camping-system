const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

function generateReservationCode() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `RES-${randomNumber}`;
}

function maskNationalId(nationalId) {
  if (!nationalId) return null;

  const clean = nationalId.trim();

  if (clean.length < 4) {
    return null;
  }

  const last4 = clean.slice(-4);
  return {
    nationalIdLast4: last4,
    nationalIdMasked: `*******${last4}`
  };
}

async function createReservation(userId, data) {
  const checkInDate = new Date(data.checkInDate);
  const checkOutDate = new Date(data.checkOutDate);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new AppError("Invalid date format", 400);
  }

  if (checkOutDate <= checkInDate) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  const camp = await prisma.camp.findUnique({
    where: {
      id: data.campId
    }
  });

  if (!camp || camp.status !== "ACTIVE") {
    throw new AppError("Camp not found or inactive", 404);
  }

  const overlappingReservations = await prisma.campReservation.findMany({
    where: {
      campId: data.campId,
      status: {
        in: ["CONFIRMED", "CHECKED_IN"]
      },
      checkInDate: {
        lt: checkOutDate
      },
      checkOutDate: {
        gt: checkInDate
      }
    }
  });

  const usedCapacity = overlappingReservations.reduce((sum, reservation) => {
    return sum + reservation.guestCount;
  }, 0);

  if (usedCapacity + data.guestCount > camp.totalCapacity) {
    throw new AppError("Camp capacity is full for selected dates", 400);
  }

  const guestsData = data.guests.map((guest) => {
    const masked = maskNationalId(guest.nationalId);

    return {
      fullName: guest.fullName,
      nationalIdLast4: masked?.nationalIdLast4 || null,
      nationalIdMasked: masked?.nationalIdMasked || null
    };
  });

  const reservation = await prisma.campReservation.create({
    data: {
      campId: data.campId,
      userId,
      checkInDate,
      checkOutDate,
      plateNumber: data.plateNumber.toUpperCase(),
      guestCount: data.guestCount,
      reservationCode: generateReservationCode(),
      status: "CONFIRMED",
      guests: {
        create: guestsData
      }
    },
    include: {
      camp: true,
      guests: true
    }
  });

  return reservation;
}

async function getMyReservations(userId) {
  return prisma.campReservation.findMany({
    where: {
      userId
    },
    include: {
      camp: true,
      guests: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

async function getOwnerReservations(ownerId) {
  const camp = await prisma.camp.findFirst({
    where: {
      ownerId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found for this owner", 404);
  }

  return prisma.campReservation.findMany({
    where: {
      campId: camp.id
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
      guests: true,
      camp: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

module.exports = {
  createReservation,
  getMyReservations,
  getOwnerReservations
};