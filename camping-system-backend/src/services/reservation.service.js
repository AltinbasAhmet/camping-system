const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const notificationService = require("./notification.service");

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
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  if (!camp || camp.status !== "ACTIVE") {
    throw new AppError("Camp not found or inactive", 404);
  }

  // PENDING rezervasyonlar da kapasiteyi geçici olarak bloke eder; aksi halde
  // owner onayı bekleyen birden fazla talep kapasiteyi aşacak şekilde
  // onaylanabilir. Owner reddederse rezervasyon CANCELLED olur ve bu
  // hesaplamadan otomatik olarak düşer.
  const overlappingReservations = await prisma.campReservation.findMany({
    where: {
      campId: data.campId,
      status: {
        in: ["PENDING", "CONFIRMED", "CHECKED_IN"]
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
      accommodationType: data.accommodationType,
      plateNumber: data.plateNumber ? data.plateNumber.toUpperCase() : null,
      guestCount: data.guestCount,
      reservationCode: generateReservationCode(),
      status: "PENDING",
      guests: {
        create: guestsData
      }
    },
    include: {
      camp: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      },
      guests: true
    }
  });

  notificationService.notifyOwnerNewReservation(reservation);

  return reservation;
}

async function respondToReservation(ownerId, reservationId, decision) {
  const id = Number(reservationId);

  if (!id) {
    throw new AppError("Invalid reservation ID", 400);
  }

  const reservation = await prisma.campReservation.findUnique({
    where: { id },
    include: { camp: true }
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (reservation.camp.ownerId !== ownerId) {
    throw new AppError("You can only respond to reservations for your own camp", 403);
  }

  if (reservation.status !== "PENDING") {
    throw new AppError("Only pending reservations can be approved or rejected", 400);
  }

  // Madde 5: geçmişe yönelik değişiklik yasağı. Check-out tarihi geçmiş bir
  // rezervasyon kamp sahibi tarafından artık onaylanamaz/reddedilemez.
  if (reservation.checkOutDate < new Date()) {
    throw new AppError(
      "Geçmiş tarihli bir rezervasyon üzerinde işlem yapamazsınız",
      400
    );
  }

  const newStatus = decision === "approve" ? "CONFIRMED" : "CANCELLED";

  const updated = await prisma.campReservation.update({
    where: { id },
    data: {
      status: newStatus,
      respondedAt: new Date()
    },
    include: {
      camp: true,
      guests: true,
      user: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  if (newStatus === "CONFIRMED") {
    notificationService.notifyUserReservationApproved(updated);
  } else {
    notificationService.notifyUserReservationRejected(updated);
  }

  return updated;
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

async function getOwnerReservations(ownerId, campId) {
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
      throw new AppError("You can only view reservations for your own camps", 403);
    }

    filteredCampIds = [numericCampId];
  }

  return prisma.campReservation.findMany({
    where: {
      campId: {
        in: filteredCampIds
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
  respondToReservation,
  getMyReservations,
  getOwnerReservations
};