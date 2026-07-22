const cron = require("node-cron");
const reminderService = require("../services/reminder.service");

// Runs every day at 09:00 (server time); sends reminders for reservations
// whose check-in/check-out is tomorrow. The same reservation is never
// notified twice because checkInReminderSentAt/checkOutReminderSentAt is set
// (bkz. reminder.service.js).
function startReminderJob() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const { checkInCount, checkOutCount } = await reminderService.sendAllReminders();
      console.log(
        `[reminder-job] Sent ${checkInCount} check-in and ${checkOutCount} check-out reminders.`
      );
    } catch (error) {
      console.error("[reminder-job] An error occurred while sending reminders:", error.message);
    }
  });

  console.log("[reminder-job] Daily reminder task scheduled (every day at 09:00).");
}

module.exports = { startReminderJob };
