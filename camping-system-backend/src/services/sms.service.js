let loggedMissingConfig = false;

function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
  );
}

/**
 * Sends SMS (via the Twilio REST API, directly with fetch, without an
 * extra SDK dependency). If Twilio details aren't defined in .env, it logs
 * to the console instead of sending; this way the app doesn't crash in a
 * development environment without a credit card/phone number.
 * In production, once TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN /
 * TWILIO_FROM_NUMBER are defined, real sending kicks in automatically. If a
 * different provider (Netgsm, İleti Merkezi, etc.) is going to be used,
 * only the body of this file changes — the calling code
 * (notification.service.js) stays the same.
 */
async function sendSms({ to, message }) {
  if (!to) return { skipped: true, reason: "no-recipient" };

  if (!isSmsConfigured()) {
    if (!loggedMissingConfig) {
      console.log(
        "[sms] Twilio is not configured (.env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER). " +
          "Messages will be logged to the console."
      );
      loggedMissingConfig = true;
    }
    console.log(`[sms:dev] -> ${to} | ${message}`);
    return { skipped: true, reason: "sms-not-configured" };
  }

  const { normalizePhoneNumber } = require("../utils/phone");
  const recipient = normalizePhoneNumber(to);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: recipient,
        Body: message,
        ...(process.env.TWILIO_MESSAGING_SERVICE_SID
          ? { MessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID }
          : { From: process.env.TWILIO_FROM_NUMBER })
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[sms] Delivery failed (${to}): ${response.status} ${errorBody}`);
      return { skipped: true, reason: "send-error", status: response.status, detail: errorBody };
    }

    const data = await response.json();
    return { skipped: false, sid: data.sid };
  } catch (error) {
    console.error(`[sms] Delivery failed (${to}):`, error.message);
    return { skipped: true, reason: "send-error", error: error.message };
  }
}

module.exports = {
  sendSms,
  isSmsConfigured
};
