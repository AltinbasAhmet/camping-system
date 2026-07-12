const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}

function generateCustomerNumber() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `CAMP-${randomNumber}`;
}

async function register(data, file) {
  const { name, email, phone, password, role = "USER" } = data;

  if (!email && !phone) {
    throw new AppError("Email or phone is required", 400);
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new AppError("Email is already registered", 400);
    }
  }

  if (phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingPhone) {
      throw new AppError("Phone is already registered", 400);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Madde 6: kamp sahibi olarak kayıt olanlar admin onayına düşer ve
  // onaylanana kadar giriş yapamaz. USER rolü doğrudan aktif olur.
  const verificationStatus = role === "CAMP_OWNER" ? "PENDING" : "APPROVED";

  // Kamp sahibi başvurusunda kamp bilgileri (ve varsa fotoğraf) kullanıcıyla
  // birlikte tek bir işlemde oluşturulur; admin onay/red kararını bu bilgilere
  // bakarak verir (bkz. admin.service.js -> updateUserVerification).
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        verificationStatus
      }
    });

    if (role === "CAMP_OWNER") {
      const camp = await tx.camp.create({
        data: {
          ownerId: createdUser.id,
          name: data.campName,
          description: data.campDescription,
          city: data.campCity,
          district: data.campDistrict || null,
          address: data.campAddress,
          phone: data.campPhone,
          totalCapacity: Number(data.campTotalCapacity),
          caravanCapacity: Number(data.campCaravanCapacity),
          tentCapacity: data.campTentCapacity !== undefined ? Number(data.campTentCapacity) : null,
          pricePerNight: data.campPricePerNight !== undefined ? Number(data.campPricePerNight) : null,
          customerNumber: generateCustomerNumber(),
          status: "PENDING"
        }
      });

      if (file) {
        await tx.campPhoto.create({
          data: {
            campId: camp.id,
            imageUrl: `/uploads/camp-photos/${file.filename}`,
            isCover: true
          }
        });
      }
    }

    return createdUser;
  });

  if (verificationStatus === "PENDING") {
    // Onay bekleyen kamp sahibine oturum açtırılmaz; admin onaylayana kadar
    // sisteme giriş yapamaz (bkz. login()).
    return {
      token: null,
      pendingApproval: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verificationStatus: user.verificationStatus
      }
    };
  }

  const token = generateToken(user);

  return {
    token,
    pendingApproval: false,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationStatus: user.verificationStatus
    }
  };
}

async function login(data) {
  const { email, phone, password } = data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        phone ? { phone } : undefined
      ].filter(Boolean)
    }
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.role === "CAMP_OWNER" && user.verificationStatus !== "APPROVED") {
    if (user.verificationStatus === "REJECTED") {
      throw new AppError(
        "Kamp sahibi başvurunuz reddedildi. Detay için sistem yöneticisiyle iletişime geçin.",
        403
      );
    }

    throw new AppError(
      "Hesabınız sistem yöneticisi onayını bekliyor. Onaylandığında giriş yapabileceksiniz.",
      403
    );
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationStatus: user.verificationStatus
    }
  };
}

module.exports = {
  register,
  login
};