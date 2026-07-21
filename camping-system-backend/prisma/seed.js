const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@campgate.com",
    },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@campgate.com",
      password: adminPassword,
      role: "SYSTEM_ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);

  const ownerPassword = await bcrypt.hash("owner123", 10);

  const owner = await prisma.user.upsert({
    where: {
      email: "owner@campgate.com",
    },
    update: {},
    create: {
      name: "Test Camp Owner",
      email: "owner@campgate.com",
      password: ownerPassword,
      role: "CAMP_OWNER",
    },
  });

  console.log("Camp owner created:", owner.email);

  const userPassword = await bcrypt.hash("user123", 10);

const user = await prisma.user.upsert({
  where: {
    email: "user@campgate.com",
  },
  update: {},
  create: {
    name: "Test User",
    email: "user@campgate.com",
    password: userPassword,
    role: "USER",
  },
});

console.log("User created:", user.email);

  const staffPassword = await bcrypt.hash("staff123", 10);
  const staff = await prisma.user.upsert({
    where: { email: "staff@campgate.com" },
    update: { role: "STAFF", verificationStatus: "APPROVED" },
    create: {
      name: "Test Staff",
      email: "staff@campgate.com",
      password: staffPassword,
      role: "STAFF",
      verificationStatus: "APPROVED",
      contactVerifiedAt: new Date(),
    },
  });

  const firstCamp = await prisma.camp.findFirst({ orderBy: { id: "asc" } });
  if (firstCamp) {
    await prisma.campStaff.upsert({
      where: { campId_userId: { campId: firstCamp.id, userId: staff.id } },
      update: {},
      create: { campId: firstCamp.id, userId: staff.id },
    });
    console.log("Staff assigned to camp:", firstCamp.name);
  }

  console.log("Staff user created:", staff.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
