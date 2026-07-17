const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

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

// Kamp sahibi kendi kampını ekler. Yeni kamp doğrudan yayına girmez,
// admin onayına düşer (status: PENDING) — bkz. CampStatus enum.
async function createMyCamp(ownerId, data) {
  const camp = await prisma.camp.create({
    data: {
      ...data,
      ownerId,
      customerNumber: generateCustomerNumber(),
      status: "PENDING"
    }
  });

  return camp;
}

// Kamp sahibi, sahip olduğu birden fazla kamptan birini id ile günceller.
// Owner sadece kendi kampını güncelleyebilir; status alanı buradan değiştirilemez
// (yayına alma/reddetme admin onayına bağlıdır).
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

const ALLOWED_STATUSES = ["PENDING", "ACTIVE", "PASSIVE", "REJECTED"];

// NOT: Bu, tam admin panelinin bir parçası değil; kamp sahibi kendi kampını
// ekleyebilsin diye eklenen PENDING->ACTIVE onay adımını çalışır kılmak için
// gereken minimum admin fonksiyonu. Tam admin paneli ayrı bir iş kalemi.
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
  setCampStatus,
  getMyCamp,
  getMyCamps,
  updateMyCamp
};