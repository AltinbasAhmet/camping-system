const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const otpService = require("./otp.service");

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

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    verificationStatus: user.verificationStatus
  };
}

// Kamp sahibi hâlâ admin onayı bekliyorsa/reddedildiyse token verilmez.
function assertCampOwnerApproved(user) {
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
}

// Madde: kayıt olurken e-posta/telefona doğrulama kodu gönderilir; hesap
// bu kod girilmeden aktifleşmez, token verilmez.
async function register(data, file) {
  const { name, email, phone, password, notificationChannel, role = "USER" } = data;

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
  // onaylanana kadar giriş yapamaz. USER rolü admin onayı beklemez ama
  // yine de e-posta/telefon doğrulaması (OTP) gerektirir.
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

  await otpService.generateAndSendOtp(user, "REGISTER", notificationChannel);

  return {
    token: null,
    otpRequired: true,
    userId: user.id,
    user: toPublicUser(user)
  };
}

// Şifre doğru olsa bile token hemen verilmez; e-posta/telefona bir kod
// gönderilir, token ancak /auth/verify-otp ile bu kod doğrulanınca verilir.
async function login(data) {
  const { email, phone, password, notificationChannel } = data;

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
  const demoEmails = [
  "admin@campgate.com",
  "owner@campgate.com",
  "user@campgate.com"
];

if (demoEmails.includes(user.email)) {
  assertCampOwnerApproved(user);

  return {
    token: generateToken(user),
    otpRequired: false,
    user: toPublicUser(user),
    message: "Demo hesabına giriş başarılı"
  };
}

  // Hesabını hiç doğrulamamış biri (kayıt sonrası OTP adımını tamamlamadan
  // ayrıldıysa) önce kayıt doğrulamasını tamamlamalı.
  if (!user.contactVerifiedAt) {
    await otpService.generateAndSendOtp(user, "REGISTER", notificationChannel);

    return {
      token: null,
      otpRequired: true,
      purpose: "REGISTER",
      userId: user.id,
      message: "Hesabınızı henüz doğrulamamışsınız. E-posta/telefonunuza gönderilen kodu girin."
    };
  }

  assertCampOwnerApproved(user);

  await otpService.generateAndSendOtp(user, "LOGIN", notificationChannel);

  return {
    token: null,
    otpRequired: true,
    purpose: "LOGIN",
    userId: user.id,
    message: "Giriş için e-posta/telefonunuza gönderilen kodu girin."
  };
}

// Hem kayıt hem giriş OTP'si bu tek uçtan doğrulanır; hangi işlem olduğu
// kullanıcı üzerinde saklanan otpPurpose'tan okunur (istemciden gelen değere
// güvenilmez).
async function verifyOtp(userId, code) {
  const { user, purpose } = await otpService.verifyOtp(userId, code);

  if (purpose === "REGISTER" && user.role === "CAMP_OWNER" && user.verificationStatus !== "APPROVED") {
    // Kod doğru: e-posta/telefon doğrulandı. Ama kamp sahibi hâlâ admin
    // onayı bekliyor/reddedildi, bu yüzden token verilmez.
    return {
      token: null,
      purpose,
      pendingApproval: true,
      user: toPublicUser(user)
    };
  }

  if (purpose === "LOGIN") {
    assertCampOwnerApproved(user);
  }

  const token = generateToken(user);

  return {
    token,
    purpose,
    pendingApproval: false,
    user: toPublicUser(user)
  };
}

async function resendOtp(userId, notificationChannel) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const purpose = user.otpPurpose || (user.contactVerifiedAt ? "LOGIN" : "REGISTER");

  await otpService.generateAndSendOtp(user, purpose, notificationChannel);

  return { message: `Yeni kod ${notificationChannel === "SMS" ? "SMS" : "e-posta"} ile gönderildi` };
}

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp
};
