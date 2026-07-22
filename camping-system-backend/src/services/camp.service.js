const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

function normalizeCampIdentityPart(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function createCampDuplicateKey(data) {
  return [data.name, data.city, data.district, data.address]
    .map(normalizeCampIdentityPart)
    .join("|");
}

function generateCustomerNumber() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `CAMP-${randomNumber}`;
}

async function getAllCamps(query) {
  const {
    city,
    search,
    hasToilet,
    hasShower,
    hasHotWater,
    hasElectricity,
    hasWifi,
    page = 1,
    limit = 10
  } = query;

  const where = {
    status: "ACTIVE"
  };

  if (city) {
    where.city = {
      contains: city
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search
        }
      },
      {
        description: {
          contains: search
        }
      }
    ];
  }

  if (hasToilet === "true") where.hasToilet = true;
  if (hasShower === "true") where.hasShower = true;
  if (hasHotWater === "true") where.hasHotWater = true;
  if (hasElectricity === "true") where.hasElectricity = true;
  if (hasWifi === "true") where.hasWifi = true;

  const skip = (Number(page) - 1) * Number(limit);

  const [camps, total] = await Promise.all([
    prisma.camp.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        photos: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
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

async function getMyCamps(ownerId) {
  const camps = await prisma.camp.findMany({
    where: {
      ownerId
    },
    include: {
      photos: true,
      events: true,
      reservations: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return camps;
}

async function getCampById(id) {
  const camp = await prisma.camp.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      photos: true,
      events: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!camp || camp.status !== "ACTIVE") {
    throw new AppError("Camp not found", 404);
  }

  return camp;
}

async function createCampByAdmin(data) {
  const owner = await prisma.user.findUnique({
    where: {
      id: data.ownerId
    }
  });

  if (!owner) {
    throw new AppError("Owner user not found", 404);
  }

  if (owner.role !== "CAMP_OWNER") {
    throw new AppError("Selected user must have CAMP_OWNER role", 400);
  }

  const camp = await prisma.camp.create({
    data: {
      ...data,
      customerNumber: generateCustomerNumber(),
      status: "ACTIVE"
    }
  });

  return camp;
}

// A camp owner adds their own campsite. The new campsite doesn't go live
// directly; it goes to admin approval (status: PENDING) — see CampStatus enum.
async function createMyCamp(ownerId, data) {
  const duplicateKey = createCampDuplicateKey(data);

  // Since the duplicateKey field may be empty in old records, we don't rely
  // solely on the database's unique constraint — we also normalize and
  // compare the existing campsite information.
  const ownerCamps = await prisma.camp.findMany({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      city: true,
      district: true,
      address: true,
      duplicateKey: true
    }
  });

  const duplicateCamp = ownerCamps.find((item) =>
    item.duplicateKey === duplicateKey || createCampDuplicateKey(item) === duplicateKey
  );

  if (duplicateCamp) {
    throw new AppError(
      "You have already added this campsite. The same campsite cannot be added again.",
      409
    );
  }

  try {
    return await prisma.camp.create({
      data: {
        ...data,
        ownerId,
        duplicateKey,
        customerNumber: generateCustomerNumber(),
        status: "PENDING"
      }
    });
  } catch (error) {
    // If two requests are sent at the same time, the composite unique
    // index in the database blocks the second record. Returns a clear
    // message to the user instead of a raw Prisma error.
    if (error?.code === "P2002") {
      throw new AppError(
        "You have already added this campsite. The same campsite cannot be added again.",
        409
      );
    }
    throw error;
  }
}

// A camp owner with more than one campsite updates one of them by id.
// An owner can only update their own campsite; the status field cannot be
// changed here (going live/being rejected depends on admin approval).
async function updateCampById(ownerId, campId, data) {
  const id = Number(campId);

  if (!id) {
    throw new AppError("Invalid camp ID", 400);
  }

  const camp = await prisma.camp.findUnique({
    where: { id }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  if (camp.ownerId !== ownerId) {
    throw new AppError("You can only update your own camp", 403);
  }

  return prisma.camp.update({
    where: { id },
    data
  });
}


// A camp owner can only delete their own campsite. Related records are
// cleaned up in dependency order within a single transaction so they don't
// cause a foreign key error.
async function deleteCampById(ownerId, campId) {
  const id = Number(campId);

  if (!id) {
    throw new AppError("Invalid camp ID", 400);
  }

  const camp = await prisma.camp.findUnique({
    where: { id },
    select: { id: true, ownerId: true, name: true }
  });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  if (camp.ownerId !== ownerId) {
    throw new AppError("You can only delete your own camp", 403);
  }

  await prisma.$transaction(async (tx) => {
    const reservations = await tx.campReservation.findMany({
      where: { campId: id },
      select: { id: true }
    });
    const reservationIds = reservations.map((reservation) => reservation.id);

    if (reservationIds.length > 0) {
      await tx.reservationGuest.deleteMany({
        where: { reservationId: { in: reservationIds } }
      });
    }

    await tx.campReservation.deleteMany({ where: { campId: id } });

    const events = await tx.campEvent.findMany({
      where: { campId: id },
      select: { id: true }
    });
    const eventIds = events.map((event) => event.id);

    if (eventIds.length > 0) {
      await tx.eventBooking.deleteMany({
        where: { eventId: { in: eventIds } }
      });
    }

    await tx.campEvent.deleteMany({ where: { campId: id } });
    await tx.campComment.deleteMany({ where: { campId: id } });
    await tx.campPhoto.deleteMany({ where: { campId: id } });
    await tx.campStaff.deleteMany({ where: { campId: id } });
    await tx.camp.delete({ where: { id } });
  });

  return camp;
}

const ALLOWED_STATUSES = ["PENDING", "ACTIVE", "PASSIVE", "REJECTED"];

// NOTE: This is not part of the full admin panel; it's the minimum admin
// function needed to make the PENDING->ACTIVE approval step work so a camp
// owner can add their own campsite. The full admin panel is a separate work item.
async function setCampStatus(campId, status) {
  const id = Number(campId);

  if (!id) {
    throw new AppError("Invalid camp ID", 400);
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new AppError("Invalid status value", 400);
  }

  const camp = await prisma.camp.findUnique({ where: { id } });

  if (!camp) {
    throw new AppError("Camp not found", 404);
  }

  return prisma.camp.update({
    where: { id },
    data: { status }
  });
}

async function getMyCamp(ownerId) {
  const camp = await prisma.camp.findFirst({
    where: {
      ownerId
    },
    include: {
      photos: true,
      events: true
    }
  });

  if (!camp) {
    throw new AppError("Camp not found for this owner", 404);
  }

  return camp;
}

async function updateMyCamp(ownerId, data) {
  const camp = await prisma.camp.findFirst({
    where: {
      ownerId
    }
  });

  if (!camp) {
    throw new AppError("Camp not found for this owner", 404);
  }

  return prisma.camp.update({
    where: {
      id: camp.id
    },
    data
  });
}

module.exports = {
  getAllCamps,
  getCampById,
  createCampByAdmin,
  createMyCamp,
  updateCampById,
  deleteCampById,
  setCampStatus,
  getMyCamp,
  getMyCamps,
  updateMyCamp
};