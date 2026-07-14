const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const notificationService = require("./notification.service");
const reminderService = require("./reminder.service");

// ---------- Dashboard ----------

async function getDashboardStats() {
  const [
    totalUsers,
    usersByRoleRaw,
    totalCamps,
    campsByStatusRaw,
    totalReservations,
    reservationsByStatusRaw,
    totalEvents,
    totalEventBookings,
    pendingReservations,
    pendingCamps,
    pendingCampOwners
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.camp.count(),
    prisma.camp.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.campReservation.count(),
    prisma.campReservation.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.campEvent.count(),
    prisma.eventBooking.count(),
    prisma.campReservation.findMany({
      where: { status: "PENDING" },
      include: { camp: true, user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.camp.findMany({
      where: { status: "PENDING" },
      include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.user.findMany({
      where: { role: "CAMP_OWNER", verificationStatus: "PENDING" },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const usersByRole = Object.fromEntries(usersByRoleRaw.map((row) => [row.role, row._count.role]));
  const campsByStatus = Object.fromEntries(campsByStatusRaw.map((row) => [row.status, row._count.status]));
  const reservationsByStatus = Object.fromEntries(
    reservationsByStatusRaw.map((row) => [row.status, row._count.status])
  );

  return {
    totalUsers,
    usersByRole,
    totalCamps,
    campsByStatus,
    totalReservations,
    reservationsByStatus,
    totalEvents,
    totalEventBookings,
    pendingReservations,
    pendingCamps,
    pendingCampOwners
  };
}

// ---------- Users ----------

async function getAllUsers(query) {
  const { role, search, verificationStatus, page = 1, limit = 20 } = query;

  const where = {};

  if (role) where.role = role;
  if (verificationStatus) where.verificationStatus = verificationStatus;

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        _count: { select: { ownedCamps: true, reservations: true, eventBookings: true } },
        ownedCamps: {
          where: { status: "PENDING" },
          include: { photos: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      verificationStatus: true,
      createdAt: true,
      ownedCamps: { include: { photos: true } },
      reservations: { include: { camp: true }, orderBy: { createdAt: "desc" } },
      eventBookings: { include: { event: true }, orderBy: { bookedAt: "desc" } }
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

async function updateUserRole(id, role) {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: { role },
    select: { id: true, name: true, email: true, phone: true, role: true, verificationStatus: true }
  });
}

// Madde 6: kamp sahibi başvurusunu admin onaylar ya da reddeder.
async function updateUserVerification(id, verificationStatus) {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "CAMP_OWNER") {
    throw new AppError("Verification approval only applies to camp owner accounts", 400);
  }

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { verificationStatus },
    select: { id: true, name: true, email: true, phone: true, role: true, verificationStatus: true }
  });

  // Kayıt sırasında oluşturulan kamp başvurusu, sahibiyle aynı kararı alır:
  // onaylanınca kamp yayına girer, reddedilince kamp de reddedilmiş sayılır.
  // Sadece hâlâ PENDING durumundaki kampları etkiler; admin ayrıca elle
  // farklı bir statüye almışsa (örn. PASSIVE) buna dokunulmaz.
  if (verificationStatus === "APPROVED" || verificationStatus === "REJECTED") {
    await prisma.camp.updateMany({
      where: { ownerId: Number(id), status: "PENDING" },
      data: { status: verificationStatus === "APPROVED" ? "ACTIVE" : "REJECTED" }
    });
  }

  notificationService.notifyCampOwnerVerification(updated, verificationStatus);

  return updated;
}

async function deleteUser(id) {
  const numericId = Number(id);

  const user = await prisma.user.findUnique({
    where: { id: numericId },
    include: {
      _count: { select: { ownedCamps: true, reservations: true, eventBookings: true } }
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { ownedCamps, reservations, eventBookings } = user._count;

  if (ownedCamps > 0 || reservations > 0 || eventBookings > 0) {
    throw new AppError(
      "Bu kullanıcıya bağlı kamp, rezervasyon veya bilet kayıtları var; önce onları silin ya da devredin",
      400
    );
  }

  await prisma.user.delete({ where: { id: numericId } });

  return { message: "User deleted successfully" };
}

// ---------- Camps ----------

async function getAllCampsForAdmin(query) {
  const { status, search, page = 1, limit = 20 } = query;

  const where = {};

  if (status) where.status = status;

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { customerNumber: { contains: search } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [camps, total] = await Promise.all([
    prisma.camp.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        photos: true,
        _count: { select: { reservations: true, events: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.camp.count({ where })
  ]);

  return {
    data: camps,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  };
}

async function getCampByIdForAdmin(id) {
  const camp = await prisma.camp.findUnique({
    where: { id: Number(id) },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      photos: true,
      events: true,
      reservations: { include: { user: { select: { id: true, name: true, email: true } } } }
    }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  return camp;
}

async function updateCampByAdmin(id, data) {
  const camp = await prisma.camp.findUnique({ where: { id: Number(id) } });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  return prisma.camp.update({
    where: { id: Number(id) },
    data
  });
}

async function deleteCampByAdmin(id) {
  const numericId = Number(id);

  const camp = await prisma.camp.findUnique({
    where: { id: numericId },
    include: { _count: { select: { reservations: true, events: true } } }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  if (camp._count.reservations > 0 || camp._count.events > 0) {
    throw new AppError(
      "Bu kampa ait rezervasyon veya etkinlik kayıtları var; kampı silmek yerine 'PASSIVE' durumuna alabilirsiniz",
      400
    );
  }

  await prisma.campPhoto.deleteMany({ where: { campId: numericId } });
  await prisma.camp.delete({ where: { id: numericId } });

  return { message: "Camp deleted successfully" };
}

// ---------- Reservations ----------

async function getAllReservationsForAdmin(query) {
  const { status, campId, page = 1, limit = 20 } = query;

  const where = {};

  if (status) where.status = status;
  if (campId) where.campId = Number(campId);

  const skip = (Number(page) - 1) * Number(limit);

  const [reservations, total] = await Promise.all([
    prisma.campReservation.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        camp: { select: { id: true, name: true, ownerId: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        guests: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.campReservation.count({ where })
  ]);

  return {
    data: reservations,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  };
}

// Madde 5'in istisnası: geçmişe yönelik değişiklik yasağı sadece USER ve
// CAMP_OWNER için geçerli; SYSTEM_ADMIN her zaman düzeltme yapabilir.
async function updateReservationStatusByAdmin(id, status) {
  const reservation = await prisma.campReservation.findUnique({ where: { id: Number(id) } });

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  const updated = await prisma.campReservation.update({
    where: { id: Number(id) },
    data: { status, respondedAt: new Date() },
    include: { camp: true, guests: true, user: { select: { id: true, name: true, email: true, phone: true } } }
  });

  notificationService.notifyUserReservationStatusChanged(updated);

  return updated;
}

// ---------- Camp Events ----------

async function getAllCampEventsForAdmin(query) {
  const { campId, page = 1, limit = 20 } = query;

  const where = {};
  if (campId) where.campId = Number(campId);

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    prisma.campEvent.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        camp: { select: { id: true, name: true, ownerId: true } },
        organizer: { select: { id: true, name: true, role: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { dateTime: "desc" }
    }),
    prisma.campEvent.count({ where })
  ]);

  return {
    data: events.map((event) => ({ ...event, ticketsSold: event._count.bookings })),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  };
}

async function deleteCampEventByAdmin(id) {
  const numericId = Number(id);

  const event = await prisma.campEvent.findUnique({ where: { id: numericId } });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  // Admin en yetkili kullanıcı olduğu için biletleri de birlikte iptal edebilir.
  await prisma.eventBooking.deleteMany({ where: { eventId: numericId } });
  await prisma.campEvent.delete({ where: { id: numericId } });

  return { message: "Event and its bookings deleted successfully" };
}

// ---------- Event Bookings ----------

async function getAllEventBookingsForAdmin(query) {
  const { eventId, userId, page = 1, limit = 20 } = query;

  const where = {};
  if (eventId) where.eventId = Number(eventId);
  if (userId) where.userId = Number(userId);

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    prisma.eventBooking.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        event: { include: { camp: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { bookedAt: "desc" }
    }),
    prisma.eventBooking.count({ where })
  ]);

  return {
    data: bookings,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  };
}

async function deleteEventBookingByAdmin(id) {
  const numericId = Number(id);

  const booking = await prisma.eventBooking.findUnique({ where: { id: numericId } });

  if (!booking) {
    throw new AppError("Event booking not found", 404);
  }

  await prisma.eventBooking.delete({ where: { id: numericId } });

  return { message: "Event booking cancelled successfully" };
}

// Test/demo amaçlı: normalde her gün 09:00'da otomatik çalışan hatırlatma
// görevini admin elle de tetikleyebilir (bkz. reminder.job.js).
async function runReminders() {
  return reminderService.sendAllReminders();
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserVerification,
  deleteUser,
  getAllCampsForAdmin,
  getCampByIdForAdmin,
  updateCampByAdmin,
  deleteCampByAdmin,
  getAllReservationsForAdmin,
  updateReservationStatusByAdmin,
  getAllCampEventsForAdmin,
  deleteCampEventByAdmin,
  getAllEventBookingsForAdmin,
  deleteEventBookingByAdmin,
  runReminders
};
