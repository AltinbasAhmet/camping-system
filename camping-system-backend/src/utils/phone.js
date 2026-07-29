function normalizePhoneNumber(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  if (/^05\d{9}$/.test(digits)) return `+9${digits}`;
  if (/^5\d{9}$/.test(digits)) return `+90${digits}`;
  if (/^905\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\d{10,15}$/.test(digits)) return `+${digits}`;
  return String(value).trim();
}

function phoneLookupCandidates(value) {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return [];
  const digits = normalized.replace(/\D/g, "");
  const candidates = new Set([String(value).trim(), normalized]);
  if (digits.startsWith("90") && digits.length === 12) {
    candidates.add(`0${digits.slice(2)}`);
    candidates.add(digits.slice(2));
    candidates.add(digits);
  }
  return [...candidates];
}

module.exports = { normalizePhoneNumber, phoneLookupCandidates };
