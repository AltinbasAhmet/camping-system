const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

function normalizePlate(value) {
  return String(value || "").replace(/[\s-]/g, "").toUpperCase();
}

async function getAccessibleCampIds(actor) {
  if (actor.role === "SYSTEM_ADMIN") {
    const camps = await prisma.camp.findMany({ select: { id: true } });
    return camps.map((camp) => camp.id);
  }

  if (actor.role === "CAMP_OWNER") {
    const camps = await prisma.camp.findMany({
      where: { ownerId: actor.id },
      select: { id: true }
    });
    return camps.map((camp) => camp.id);
  }

  if (actor.role === "STAFF") {
    const assignments = await prisma.campStaff.findMany({
      where: { userId: actor.id },
      select: { campId: true }
    });
    return assignments.map((assignment) => assignment.campId);
  }

  return [];
}

async function buildCampScope(actor, requestedCampId) {
  const campIds = await getAccessibleCampIds(actor);

  if (campIds.length === 0) {
    throw new AppError("İşlem yapabileceğiniz bir kamp bulunmuyor", 403);
  }

  if (requestedCampId) {
    const campId = Number(requestedCampId);
    if (!campIds.includes(campId)) {
      throw new AppError("Bu kamp için işlem yetkiniz yok", 403);
    }
    return [campId];
  }

  return campIds;
}

async function searchReservation(actor, criteria) {
  const campIds = await buildCampScope(actor, criteria.campId);
  const lookup = [];

  if (criteria.plateNumber) {
    lookup.push({ plateNumber: normalizePlate(criteria.plateNumber) });
  }
  if (criteria.reservationCode) {
    lookup.push({ reservationCode: criteria.reservationCode.trim().toUpperCase() });
  }

  const reservation = await prisma.campReservation.findFirst({
    where: {
      campId: { in: campIds },
      OR: lookup,
      status: { in: ["CONFIRMED", "CHECKED_IN"] }
    },
    include: {
      camp: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      guests: true
    },
    orderBy: { checkInDate: "asc" }
  });

  if (!reservation) {
    throw new AppError("Uygun rezervasyon bulunamadı", 404);
  }

  return reservation;
}

async function getScopedReservation(actor, reservationId) {
  const campIds = await buildCampScope(actor);
  const reservation = await prisma.campReservation.findFirst({
    where: { id: Number(reservationId), campId: { in: campIds } }
  });

  if (!reservation) {
    throw new AppError("Rezervasyon bulunamadı veya bu kamp için yetkiniz yok", 404);
  }

  return reservation;
}

async function confirmCheckIn(actor, reservationId) {
  const reservation = await getScopedReservation(actor, reservationId);
  if (reservation.status !== "CONFIRMED") {
    throw new AppError("Yalnızca onaylanmış rezervasyonlarda check-in yapılabilir", 400);
  }

  return prisma.campReservation.update({
    where: { id: reservation.id },
    data: { status: "CHECKED_IN" },
    include: { camp: true, guests: true, user: { select: { id: true, name: true, email: true, phone: true } } }
  });
}

async function confirmCheckOut(actor, reservationId) {
  const reservation = await getScopedReservation(actor, reservationId);
  if (reservation.status !== "CHECKED_IN") {
    throw new AppError("Yalnızca giriş yapmış rezervasyonlarda check-out yapılabilir", 400);
  }

  return prisma.campReservation.update({
    where: { id: reservation.id },
    data: { status: "CHECKED_OUT" },
    include: { camp: true, guests: true, user: { select: { id: true, name: true, email: true, phone: true } } }
  });
}

module.exports = { searchReservation, confirmCheckIn, confirmCheckOut, getAccessibleCampIds };
