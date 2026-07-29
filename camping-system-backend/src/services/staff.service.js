const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function assignedCampIds(userId) {
  const assignments = await prisma.campStaff.findMany({
    where: { userId: Number(userId) },
    select: { campId: true }
  });
  return assignments.map((assignment) => assignment.campId);
}

async function getAssignedCamps(userId) {
  const assignments = await prisma.campStaff.findMany({
    where: { userId: Number(userId) },
    include: {
      camp: {
        include: {
          photos: true,
          owner: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { reservations: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return assignments.map((assignment) => ({ ...assignment.camp, assignedAt: assignment.createdAt }));
}

async function getReservations(userId, query = {}) {
  const campIds = await assignedCampIds(userId);
  if (campIds.length === 0) return [];

  const where = { campId: { in: campIds } };
  if (query.campId) {
    const campId = Number(query.campId);
    if (!campIds.includes(campId)) throw new AppError("You do not have permission to view this campsite's reservations", 403);
    where.campId = campId;
  }
  if (query.status) where.status = query.status;
  if (query.search) {
    const search = query.search.trim();
    where.OR = [
      { reservationCode: { contains: search } },
      { plateNumber: { contains: search.toUpperCase() } },
      { user: { name: { contains: search } } }
    ];
  }

  return prisma.campReservation.findMany({
    where,
    include: {
      camp: { select: { id: true, name: true, city: true, district: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
      guests: true
    },
    orderBy: [{ checkInDate: "asc" }, { createdAt: "desc" }]
  });
}

module.exports = { getAssignedCamps, getReservations };
