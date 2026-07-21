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
  const rawSearch = String(
    criteria.searchTerm ||
    criteria.reservationCode ||
    criteria.plateNumber ||
    criteria.customerName ||
    ""
  ).trim();

  const normalizedSearch = rawSearch.toLocaleLowerCase("tr-TR");
  const normalizedCode = rawSearch.toUpperCase();
  const normalizedPlate = normalizePlate(rawSearch);

  // Plakalar geçmiş kayıtlarda boşluklu veya tireli saklanmış olabilir.
  // Bu nedenle yalnızca veritabanı eşleşmesine güvenmek yerine erişilebilir
  // rezervasyonları alıp kod, plaka ve isim karşılaştırmasını normalize ederek yapıyoruz.
  const candidates = await prisma.campReservation.findMany({
    where: {
      campId: { in: campIds },
      status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] }
    },
    include: {
      camp: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      guests: true
    },
    orderBy: [
      { checkInDate: "asc" },
      { createdAt: "desc" }
    ],
    take: 500
  });

  const reservations = candidates.filter((reservation) => {
    const codeMatches = String(reservation.reservationCode || "").toUpperCase().includes(normalizedCode);
    const plateMatches = normalizePlate(reservation.plateNumber).includes(normalizedPlate);
    const ownerMatches = String(reservation.user?.name || "")
      .toLocaleLowerCase("tr-TR")
      .includes(normalizedSearch);
    const guestMatches = reservation.guests.some((guest) =>
      String(guest.fullName || "").toLocaleLowerCase("tr-TR").includes(normalizedSearch)
    );

    return codeMatches || plateMatches || ownerMatches || guestMatches;
  }).slice(0, 20);

  if (reservations.length === 0) {
    throw new AppError("Rezervasyon bulunamadı. Personelin doğru kampa atandığını ve rezervasyonun iptal edilmediğini kontrol edin.", 404);
  }

  return reservations;
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
