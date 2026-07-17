let loggedMissingConfig = false;

function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
  );
}

/**
 * SMS gönderir (Twilio REST API üzerinden, ekstra SDK bağımlılığı olmadan
 * doğrudan fetch ile). Twilio bilgileri .env'de tanımlı değilse gönderim
 * yapmak yerine konsola loglar; böylece kredi kartı/telefon numarası olmayan
 * bir geliştirme ortamında uygulama çökmez.
 * Prodüksiyonda TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER
 * tanımlanınca gerçek gönderim otomatik devreye girer. Farklı bir sağlayıcı
 * (Netgsm, İleti Merkezi vb.) kullanılacaksa sadece bu dosyanın gövdesi
 * değişir, çağıran kod (notification.service.js) aynı kalır.
 */
async function sendSms({ to, message }) {
  if (!to) return { skipped: true, reason: "no-recipient" };

  if (!isSmsConfigured()) {
    if (!loggedMissingConfig) {
      console.log(
        "[sms] Twilio yapılandırılmamış (.env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER). " +
          "Gönderimler konsola loglanacak."
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
      console.error(`[sms] Gönderim başarısız (${to}): ${response.status} ${errorBody}`);
      return { skipped: true, reason: "send-error", status: response.status, detail: errorBody };
    }

    const data = await response.json();
    return { skipped: false, sid: data.sid };
  } catch (error) {
    console.error(`[sms] Gönderim başarısız (${to}):`, error.message);
    return { skipped: true, reason: "send-error", error: error.message };
  }
}

module.exports = {
  sendSms,
  isSmsConfigured
};
