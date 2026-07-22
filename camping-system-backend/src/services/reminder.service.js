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

// Sends a "your campsite stay starts tomorrow" notification for CONFIRMED
// reservations whose check-in date is tomorrow and that haven't had a reminder sent yet.
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

// Sends a "your campsite stay ends tomorrow" notification for CONFIRMED or
// CHECKED_IN reservations whose check-out date is tomorrow and that haven't had a reminder sent yet.
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
