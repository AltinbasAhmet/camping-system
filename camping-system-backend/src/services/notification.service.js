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
    return `Karavan (Plaka: ${reservation.plateNumber || "-"})`;
  }
  return "Çadır";
}
// diğerini ve akışın geri kalanını etkilemez (her ikisi de kendi içinde
// hata yutuyor, bkz. email.service.js / sms.service.js).
async function sendBoth({ email, sms }) {
  await Promise.all([
    email ? emailService.sendEmail(email) : Promise.resolve(),
    sms ? smsService.sendSms(sms) : Promise.resolve()
  ]);
}

// Madde 2 + 4: yeni rezervasyon talebi geldiğinde kamp sahibine bilgi gider.
async function notifyOwnerNewReservation(reservation) {
  const owner = reservation.camp?.owner;

  if (!owner) return;

  const subject = `Yeni rezervasyon talebi: ${reservation.reservationCode}`;
  const text =
    `Merhaba ${owner.name},\n\n` +
    `${reservation.camp.name} kampınız için yeni bir rezervasyon talebi var.\n\n` +
    `Rezervasyon kodu: ${reservation.reservationCode}\n` +
    `Tarih: ${formatDateOnlyTr(reservation.checkInDate)} - ${formatDateOnlyTr(reservation.checkOutDate)}\n` +
    `Misafir sayısı: ${reservation.guestCount}\n` +
    `Konaklama: ${formatAccommodationTr(reservation)}\n\n` +
    `Onaylamak veya reddetmek için panelinize giriş yapabilirsiniz.`;
  const sms = `CampPal: ${reservation.camp.name} icin yeni rezervasyon talebi (${reservation.reservationCode}). Onay icin panele giris yapin.`;

  await sendBoth({
    email: owner.email ? { to: owner.email, subject, text } : null,
    sms: owner.phone ? { to: owner.phone, message: sms } : null
  });
}

// Madde 4: rezervasyon onaylanınca kişiye bilet/rezervasyon detayları gider.
async function notifyUserReservationApproved(reservation) {
  const user = reservation.user;

  if (!user) return;

  const subject = `Rezervasyonunuz onaylandı: ${reservation.reservationCode}`;
  const text =
    `Merhaba ${user.name},\n\n` +
    `${reservation.camp.name} için rezervasyonunuz onaylandı.\n\n` +
    `Rezervasyon kodu: ${reservation.reservationCode}\n` +
    `Kamp: ${reservation.camp.name} (${reservation.camp.city}${reservation.camp.district ? "/" + reservation.camp.district : ""})\n` +
    `Adres: ${reservation.camp.address}\n` +
    `Giriş: ${formatDateOnlyTr(reservation.checkInDate)}\n` +
    `Çıkış: ${formatDateOnlyTr(reservation.checkOutDate)}\n` +
    `Misafir sayısı: ${reservation.guestCount}\n` +
    `Konaklama: ${formatAccommodationTr(reservation)}\n\n` +
    `İyi kamplar dileriz!`;
  const sms = `CampPal: ${reservation.reservationCode} kodlu rezervasyonunuz onaylandi. ${formatDateOnlyTr(reservation.checkInDate)} - ${formatDateOnlyTr(reservation.checkOutDate)}, ${reservation.camp.name}.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

async function notifyUserReservationRejected(reservation) {
  const user = reservation.user;

  if (!user) return;

  const subject = `Rezervasyonunuz reddedildi: ${reservation.reservationCode}`;
  const text =
    `Merhaba ${user.name},\n\n` +
    `Maalesef ${reservation.camp.name} için ${reservation.reservationCode} kodlu rezervasyon talebiniz kamp sahibi tarafından reddedildi.\n\n` +
    `Başka bir kamp alanına veya farklı bir tarihe rezervasyon yapmayı deneyebilirsiniz.`;
  const sms = `CampPal: ${reservation.reservationCode} kodlu rezervasyon talebiniz reddedildi.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Madde 4: admin bir rezervasyonun durumunu elle değiştirdiğinde de kişi
// bilgilendirilir (geçmişe yönelik düzeltmeler dahil).
async function notifyUserReservationStatusChanged(reservation) {
  const user = reservation.user;

  if (!user) return;

  const statusLabels = {
    PENDING: "beklemede",
    CONFIRMED: "onaylandı",
    CANCELLED: "iptal edildi",
    CHECKED_IN: "giriş yapıldı",
    CHECKED_OUT: "çıkış yapıldı"
  };
  const label = statusLabels[reservation.status] || reservation.status;

  const subject = `Rezervasyon durumu güncellendi: ${reservation.reservationCode}`;
  const text =
    `Merhaba ${user.name},\n\n` +
    `${reservation.reservationCode} kodlu rezervasyonunuzun durumu sistem yöneticisi tarafından "${label}" olarak güncellendi.\n\n` +
    `Kamp: ${reservation.camp?.name || ""}\n` +
    `Tarih: ${formatDateOnlyTr(reservation.checkInDate)} - ${formatDateOnlyTr(reservation.checkOutDate)}`;
  const sms = `CampPal: ${reservation.reservationCode} kodlu rezervasyonunuzun durumu "${label}" olarak guncellendi.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Madde 3 + 4: etkinlik bileti satın alındığında kişiye bilet detayları gider.
async function notifyUserEventTicketPurchased(booking) {
  const user = booking.user;
  const event = booking.event;

  if (!user || !event) return;

  const subject = `Bilet satın alımınız onaylandı: ${event.title}`;
  const text =
    `Merhaba ${user.name},\n\n` +
    `"${event.title}" etkinliği için bilet satın alımınız tamamlandı.\n\n` +
    `Etkinlik: ${event.title}\n` +
    `Kamp: ${event.camp?.name || ""}${event.camp?.city ? " (" + event.camp.city + ")" : ""}\n` +
    `Tarih: ${formatDateTr(event.dateTime)}\n` +
    `Bilet adedi: ${booking.guestCount}\n` +
    `Toplam tutar: ${(event.price * booking.guestCount).toLocaleString("tr-TR")} TL\n\n` +
    `İyi eğlenceler!`;
  const sms = `CampPal: "${event.title}" etkinligi icin ${booking.guestCount} bilet aldiniz. Tarih: ${formatDateTr(event.dateTime)}.`;

  await sendBoth({
    email: user.email ? { to: user.email, subject, text } : null,
    sms: user.phone ? { to: user.phone, message: sms } : null
  });
}

// Madde 6: kamp sahibi başvurusu onaylandığında/reddedildiğinde bilgi gider.
async function notifyCampOwnerVerification(user, status) {
  if (!user) return;

  const approved = status === "APPROVED";
  const subject = approved ? "Kamp sahibi hesabınız onaylandı" : "Kamp sahibi başvurunuz reddedildi";
  const text = approved
    ? `Merhaba ${user.name},\n\nKamp sahibi hesabınız sistem yöneticisi tarafından onaylandı. Artık giriş yapıp kamp alanınızı ekleyebilirsiniz.`
    : `Merhaba ${user.name},\n\nKamp sahibi başvurunuz sistem yöneticisi tarafından reddedildi. Detay için bizimle iletişime geçebilirsiniz.`;
  const sms = approved
    ? "CampPal: Kamp sahibi hesabiniz onaylandi, artik giris yapabilirsiniz."
    : "CampPal: Kamp sahibi basvurunuz reddedildi.";

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
  notifyCampOwnerVerification
};
