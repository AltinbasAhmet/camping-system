const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const otpService = require("./otp.service");
const { normalizePhoneNumber, phoneLookupCandidates } = require("../utils/phone");

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }
  return jwt.sign(
    { role: user.role, tokenVersion: user.tokenVersion || 0 },
    secret,
    { expiresIn: "15m", algorithm: "HS256", subject: String(user.id), issuer: "camppal-api", audience: "camppal-web" }
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

// No token is issued if the camp owner is still awaiting admin approval or was rejected.
function assertCampOwnerApproved(user) {
  if (user.role === "CAMP_OWNER" && user.verificationStatus !== "APPROVED") {
    if (user.verificationStatus === "REJECTED") {
      throw new AppError(
        "Your camp owner application has been rejected. Please contact the system administrator for details.",
        403
      );
    }

    throw new AppError(
      "Your account is awaiting system administrator approval. You will be able to log in once approved.",
      403
    );
  }
}

// Item: a verification code is sent to the email/phone at registration;
// the account is not activated and no token is issued until this code is entered.
async function register(data, file) {
  const { name, password, notificationChannel, role = "USER" } = data;
  const email = data.email ? data.email.trim().toLowerCase() : null;
  const phone = normalizePhoneNumber(data.phone);

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

  const hashedPassword = await bcrypt.hash(password, 12);

  // Item 6: those who register as a camp owner require admin approval and
  // cannot log in until approved. The USER role does not require admin
  // approval but still requires email/phone verification (OTP).
  const verificationStatus = role === "CAMP_OWNER" ? "PENDING" : "APPROVED";

  // For a camp owner application, the campsite information (and photo, if
  // any) is created together with the user in a single transaction; the
  // admin makes the approve/reject decision based on this information
  // (see admin.service.js -> updateUserVerification).
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

// Even if the password is correct, no token is issued immediately; a code
// is sent to the email/phone, and the token is only issued once that code
// is verified via /auth/verify-otp.
async function login(data) {
  const { password, notificationChannel } = data;
  const email = data.email ? data.email.trim().toLowerCase() : null;
  const phones = phoneLookupCandidates(data.phone);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        ...phones.map((phone) => ({ phone }))
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

  // System administrators authenticate with their password and receive the
  // secure HttpOnly session cookie immediately. Requiring an email/SMS OTP
  // here could lock administrators out when a notification provider is down.
  // This exception applies only to the SYSTEM_ADMIN role resolved from the
  // database; the client cannot request or forge it.
  if (user.role === "SYSTEM_ADMIN") {
    return {
      token: generateToken(user),
      otpRequired: false,
      purpose: null,
      userId: user.id,
      user: toPublicUser(user),
      message: "Giriş başarılı"
    };
  }

  // Someone who has never verified their account (left before completing
  // the OTP step after registration) must first complete registration verification.
  if (!user.contactVerifiedAt) {
    await otpService.generateAndSendOtp(user, "REGISTER", notificationChannel);

    return {
      token: null,
      otpRequired: true,
      purpose: "REGISTER",
      userId: user.id,
      message: "You have not verified your account yet. Enter the code sent to your email/phone."
    };
  }

  assertCampOwnerApproved(user);

  await otpService.generateAndSendOtp(user, "LOGIN", notificationChannel);

  return {
    token: null,
    otpRequired: true,
    purpose: "LOGIN",
    userId: user.id,
    message: "Enter the code sent to your email/phone to log in."
  };
}

// Both registration and login OTPs are verified through this single
// endpoint; which operation it is gets read from the otpPurpose stored on
// the user (the value coming from the client is not trusted).
async function verifyOtp(userId, code) {
  const { user, purpose } = await otpService.verifyOtp(userId, code);
  if (!['REGISTER', 'LOGIN'].includes(purpose)) {
    throw new AppError("This code cannot be used for login verification", 400);
  }

  if (purpose === "REGISTER" && user.role === "CAMP_OWNER" && user.verificationStatus !== "APPROVED") {
    // Code is correct: email/phone has been verified. But the camp owner
    // is still awaiting admin approval / was rejected, so no token is issued.
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

  return { message: `New code sent via ${notificationChannel === "SMS" ? "SMS" : "email"}` };
}

async function forgotPassword(data) {
  const email = data.email ? data.email.trim().toLowerCase() : null;
  const phones = phoneLookupCandidates(data.phone);
  const user = await prisma.user.findFirst({
    where: { OR: [email ? { email } : undefined, ...phones.map((phone) => ({ phone }))].filter(Boolean) }
  });
  if (!user) return { userId: null, message: "If an account matches this information, a reset code has been sent." };
  await otpService.generateAndSendOtp(user, "RESET_PASSWORD", data.notificationChannel);
  return { userId: user.id, message: "If an account matches this information, a reset code has been sent." };
}

async function resetPassword(data) {
  const { user } = await otpService.verifyOtp(data.userId, data.code, "RESET_PASSWORD");
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(data.password, 12), tokenVersion: { increment: 1 } } });
  return { message: "Your password has been reset successfully" };
}

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getCurrentUser
};

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user || !user.isActive) throw new AppError("User not found", 404);
  return toPublicUser(user);
}
