const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

async function createCampOwner(data) {
  const existingEmail = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  });

  if (existingEmail) {
    throw new AppError("Email is already registered", 400);
  }

  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: data.phone
      }
    });

    if (existingPhone) {
      throw new AppError("Phone is already registered", 400);
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const owner = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: "CAMP_OWNER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true
    }
  });

  return owner;
}

async function getCampOwners() {
  return prisma.user.findMany({
    where: {
      role: "CAMP_OWNER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      ownedCamps: {
        select: {
          id: true,
          name: true,
          city: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

module.exports = {
  createCampOwner,
  getCampOwners
};