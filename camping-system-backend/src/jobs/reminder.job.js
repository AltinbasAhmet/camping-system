const cron = require("node-cron");
const reminderService = require("../services/reminder.service");

// Her gün saat 09:00'da (sunucu saatiyle) çalışır; check-in/check-out'u
// yarın olan rezervasyonlara hatırlatma gönderir. Aynı rezervasyona bir daha
// gönderilmez çünkü checkInReminderSentAt/checkOutReminderSentAt işaretlenir
// (bkz. reminder.service.js).
function startReminderJob() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const { checkInCount, checkOutCount } = await reminderService.sendAllReminders();
      console.log(
        `[reminder-job] ${checkInCount} check-in, ${checkOutCount} check-out hatırlatması gönderildi.`
      );
    } catch (error) {
      console.error("[reminder-job] Hatırlatmalar gönderilirken hata oluştu:", error.message);
    }
  });

  console.log("[reminder-job] Günlük hatırlatma görevi zamanlandı (her gün 09:00).");
}

module.exports = { startReminderJob };
