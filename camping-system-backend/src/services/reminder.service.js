const prisma = require("../lib/prisma");
const notificationService = require("./notification.service");

function dayRange(daysFromNow) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + daysFromNow);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

// Check-in tarihi yarın olan, henüz hatırlatma gönderilmemiş CONFIRMED
// rezervasyonlara "yarın kampınız başlıyor" bildirimi gönderir.
async function sendCheckInReminders() {
  const { start, end } = dayRange(1);

  const reservations = await prisma.campReservation.findMany({
    where: {
      status: "CONFIRMED",
      checkInReminderSentAt: null,
      checkInDate: { gte: start, lt: end }
    },
    include: {
      camp: true,
      user: { select: { id: true, name: true, email: true, phone: true } }
    }
  });

  for (const reservation of reservations) {
    await notificationService.notifyUpcomingCheckIn(reservation);
    await prisma.campReservation.update({
      where: { id: reservation.id },
      data: { checkInReminderSentAt: new Date() }
    });
  }

  return reservations.length;
}

// Check-out tarihi yarın olan, henüz hatırlatma gönderilmemiş CONFIRMED ya
// da CHECKED_IN rezervasyonlara "yarın kampınız bitiyor" bildirimi gönderir.
async function sendCheckOutReminders() {
  const { start, end } = dayRange(1);

  const reservations = await prisma.campReservation.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkOutReminderSentAt: null,
      checkOutDate: { gte: start, lt: end }
    },
    include: {
      camp: true,
      user: { select: { id: true, name: true, email: true, phone: true } }
    }
  });

  for (const reservation of reservations) {
    await notificationService.notifyUpcomingCheckOut(reservation);
    await prisma.campReservation.update({
      where: { id: reservation.id },
      data: { checkOutReminderSentAt: new Date() }
    });
  }

  return reservations.length;
}

async function sendAllReminders() {
  const [checkInCount, checkOutCount] = await Promise.all([
    sendCheckInReminders(),
    sendCheckOutReminders()
  ]);

  return { checkInCount, checkOutCount };
}

module.exports = {
  sendCheckInReminders,
  sendCheckOutReminders,
  sendAllReminders
};
