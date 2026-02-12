/**
 * Allow only letters, spaces, hyphen, apostrophe (for names like O'Brien, Mary-Jane).
 * Use this on name input onChange to block digits/symbols.
 */
export function onlyNameChars(value: string): string {
  return value.replace(/[^a-zA-Z\s'-]/g, "");
}

/**
 * Normalize a name: trim, collapse multiple spaces, title-case (first letter of each word).
 */
export function formatName(value: string | null | undefined): string {
  if (value == null) return "";
  const s = value.trim().replace(/\s+/g, " ");
  return s
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""))
    .filter(Boolean)
    .join(" ");
}

/**
 * Normalize a nickname: trim, collapse multiple spaces. No title-case (user may want "Runner123").
 */
export function formatNickname(value: string | null | undefined): string {
  if (value == null) return "";
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Normalize phone for storage: only digits, always with leading +.
 * Result looks like "+37061234567".
 */
export function normalizePhone(value: string | null | undefined): string {
  if (value == null) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  return `+${digits}`;
}

/**
 * Format phone for display: add spaces (e.g. "+370 612 34567").
 * Assumes input is already normalized (digits and optional leading +).
 */
export function formatPhoneDisplay(value: string | null | undefined): string {
  if (value == null) return "";
  const normalized = normalizePhone(value);
  if (normalized.length === 0) return "";
  const hasPlus = normalized.startsWith("+");
  const digits = hasPlus ? normalized.slice(1) : normalized;
  if (digits.length <= 3) return normalized;
  const rest = digits.slice(3);
  const groups: string[] = [];
  for (let i = 0; i < rest.length; i += 3) {
    groups.push(rest.slice(i, i + 3));
  }
  const prefix = (hasPlus ? "+" : "") + digits.slice(0, 3);
  return [prefix, ...groups].join(" ");
}
