const emailService = require("./email.service");
const smsService = require("./sms.service");

function formatDateTr(date) {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateOnlyTr(date) {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatAccommodationTr(reservation) {
  if (reservation.accommodationType === "CARAVAN") {
    return `Caravan (Plate: ${reservation.plateNumber || "-"})`;
  }
  return "Tent";
}
// A failure in one channel does not affect the other or the rest of the
// flow (both swallow their own errors internally, see email.service.js /
// sms.service.js).
async function sendBoth({ email, sms }) {
  await Promise.all([
    email ? emailService.sendEmail(email) : Promise.resolve(),
    sms ? smsService.sendSms(sms) : Promise.resolve()
  ]);
}

// Item 2 + 4: the campsite owner is notified when a new reservation request comes in.
async function notifyOwnerNewReservation(reservation) {
  const owner = reservation.camp?.owner;

  if (!owner) return;

  const subject = `New reservation request: ${reservation.reservationCode}`;
  const text =
    `Hello ${owner.name},\n\n` +
    `There is a new reservation request for your campsite ${reservation.camp.name}.\n\n` +
    `Reservation code: ${reservation.reservationCode}\n` +
    `Date: ${formatDateOnlyTr(reservation.checkInDate)} - ${formatDateOnlyTr(reservation.checkOutDate)}\n` +
    `Number of guests: ${reservation.guestCount}\n` +
    `Accommodation: ${formatAccommodationTr(reservation)}\n\n` +
    `You can log in to your dashboard to approve or reject it.`;
  const sms = `CampPal: New reservation request for ${reservation.camp.name} (${reservation.reservationCode}). Log in to your dashboard to approve it.`;

  await sendBoth({
    email: owner.email ? { to: owner.email, subject, text } : null,
    sms: owner.phone ? { to: owner.phone, message: sms } : null
  });
}

// Item 4: ticket/reservation details are sent to the person once the reservation is approved.
async function notifyUserReservationApproved(reservation) {
  const user = reservation.user;

  if (!user) return;

  const subject = `Your reservation has been approved: ${reservation.reservationCode}`;
  const text =
    `Hello ${user.name},\n\n` +
    `Your reservation for ${reservation.camp.name} has been approved.\n\n` +
    `Reservation code: ${reservation.reservationCode}\n` +
    `Campsite: ${reservation.camp.name} (${reservation.camp.city}${reservation.camp.district ? "/" + reservation.camp.district : ""})\n` +
    `Address: ${reservation.camp.address}\n` +
    `Check-in: ${formatDateOnlyTr(reservation.checkInDate)}\n` +
    `Check-out: ${formatDateOnlyTr(reservation.checkOutDate)}\n` +
    `Number of guests: ${reservation.guestCount}\n` +
    `Accommodation: ${formatAccommodationTr(reservation)}\n\n` +
    `Happy camping!`;
  const sms = `CampPal: Your reservation ${reservation.reservationCode} has been approved. ${formatDateOnlyTr(reservation.checkInDate)} - ${formatDateOnlyTr(reservation.checkOutDate)}, ${reservation.camp.name}.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

async function notifyUserReservationRejected(reservation) {
  const user = reservation.user;

  if (!user) return;

  const subject = `Your reservation has been rejected: ${reservation.reservationCode}`;
  const text =
    `Hello ${user.name},\n\n` +
    `Unfortunately, your reservation request ${reservation.reservationCode} for ${reservation.camp.name} has been rejected by the campsite owner.\n\n` +
    `You can try booking a different campsite or a different date.`;
  const sms = `CampPal: Your reservation request ${reservation.reservationCode} has been rejected.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Item 4: the person is also notified when an admin manually changes a
// reservation's status (including retroactive corrections).
async function notifyUserReservationStatusChanged(reservation) {
  const user = reservation.user;

  if (!user) return;

  const statusLabels = {
    PENDING: "pending",
    CONFIRMED: "approved",
    CANCELLED: "cancelled",
    CHECKED_IN: "checked in",
    CHECKED_OUT: "checked out"
  };
  const label = statusLabels[reservation.status] || reservation.status;

  const subject = `Reservation status updated: ${reservation.reservationCode}`;
  const text =
    `Hello ${user.name},\n\n` +
    `The status of your reservation ${reservation.reservationCode} has been updated to "${label}" by the system administrator.\n\n` +
    `Campsite: ${reservation.camp?.name || ""}\n` +
    `Date: ${formatDateOnlyTr(reservation.checkInDate)} - ${formatDateOnlyTr(reservation.checkOutDate)}`;
  const sms = `CampPal: The status of your reservation ${reservation.reservationCode} has been updated to "${label}".`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Item 3 + 4: ticket details are sent to the person once an event ticket is purchased.
async function notifyUserEventTicketPurchased(booking) {
  const user = booking.user;
  const event = booking.event;

  if (!user || !event) return;

  const subject = `Your ticket purchase has been confirmed: ${event.title}`;
  const text =
    `Hello ${user.name},\n\n` +
    `Your ticket purchase for the event "${event.title}" is complete.\n\n` +
    `Event: ${event.title}\n` +
    `Campsite: ${event.camp?.name || ""}${event.camp?.city ? " (" + event.camp.city + ")" : ""}\n` +
    `Date: ${formatDateTr(event.dateTime)}\n` +
    `Number of tickets: ${booking.guestCount}\n` +
    `Total amount: ${(event.price * booking.guestCount).toLocaleString("tr-TR")} TL\n\n` +
    `Have fun!`;
  const sms = `CampPal: You purchased ${booking.guestCount} ticket(s) for "${event.title}". Date: ${formatDateTr(event.dateTime)}.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Item 6: the person is notified when their camp owner application is approved/rejected.
async function notifyCampOwnerVerification(user, status) {
  if (!user) return;

  const approved = status === "APPROVED";
  const subject = approved ? "Your camp owner account has been approved" : "Your camp owner application has been rejected";
  const text = approved
    ? `Hello ${user.name},\n\nYour camp owner account has been approved by the system administrator. You can now log in and add your campsite.`
    : `Hello ${user.name},\n\nYour camp owner application has been rejected by the system administrator. You can contact us for details.`;
  const sms = approved
    ? "CampPal: Your camp owner account has been approved, you can now log in."
    : "CampPal: Your camp owner application has been rejected.";

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Item: the person who organized the event (campsite owner or camper,
// whoever organized it) is also notified when a ticket is sold.
async function notifyOrganizerTicketSold(booking) {
  const organizer = booking.event?.organizer;
  const buyer = booking.user;

  if (!organizer) return;

  const subject = `New ticket sale: ${booking.event.title}`;
  const text =
    `Hello ${organizer.name},\n\n` +
    `"${booking.event.title}" ticket sale for your event.\n\n` +
    `Buyer: ${buyer?.name || "-"}\n` +
    `Number of tickets: ${booking.guestCount}\n` +
    `Total amount: ${(booking.event.price * booking.guestCount).toLocaleString("tr-TR")} TL\n` +
    `Event date: ${formatDateTr(booking.event.dateTime)}`;
  const sms = `CampPal: New sale of ${booking.guestCount} ticket(s) for your event "${booking.event.title}".`;

  await sendBoth({
    email: organizer.email ? { to: organizer.email, subject, text } : null,
    sms: organizer.phone ? { to: organizer.phone, message: sms } : null
  });
}

// Item: reminder sent one day before the check-in date.
async function notifyUpcomingCheckIn(reservation) {
  const user = reservation.user;

  if (!user) return;

  const subject = `Your campsite stay starts tomorrow: ${reservation.reservationCode}`;
  const text =
    `Hello ${user.name},\n\n` +
    `Your reservation at ${reservation.camp.name} starts tomorrow (${formatDateOnlyTr(reservation.checkInDate)}).\n\n` +
    `Reservation code: ${reservation.reservationCode}\n` +
    `Campsite: ${reservation.camp.name} (${reservation.camp.city})\n` +
    `Address: ${reservation.camp.address}\n\n` +
    `Happy camping!`;
  const sms = `CampPal: Your reservation at ${reservation.camp.name} (${reservation.reservationCode}) starts tomorrow.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Item: reminder sent one day before the check-out date.
async function notifyUpcomingCheckOut(reservation) {
  const user = reservation.user;

  if (!user) return;

  const subject = `Your campsite stay ends tomorrow: ${reservation.reservationCode}`;
  const text =
    `Hello ${user.name},\n\n` +
    `Your reservation at ${reservation.camp.name} ends tomorrow (${formatDateOnlyTr(reservation.checkOutDate)}).\n\n` +
    `Reservation code: ${reservation.reservationCode}\n\n` +
    `Have a safe trip!`;
  const sms = `CampPal: Your reservation at ${reservation.camp.name} (${reservation.reservationCode}) ends tomorrow.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

module.exports = {
  notifyOwnerNewReservation,
  notifyUserReservationApproved,
  notifyUserReservationRejected,
  notifyUserReservationStatusChanged,
  notifyUserEventTicketPurchased,
  notifyOrganizerTicketSold,
  notifyUpcomingCheckIn,
  notifyUpcomingCheckOut,
  notifyCampOwnerVerification
};
