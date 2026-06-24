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
  getMyCamp,
  updateMyCamp
};