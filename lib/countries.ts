/** Returns a flag emoji for a 2-letter ISO country code (e.g. "LT" -> "🇱🇹"). */
export function getCountryFlagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "";
  const a = 0x1f1e6; // regional indicator A
  const c1 = code.toUpperCase().charCodeAt(0) - 65;
  const c2 = code.toUpperCase().charCodeAt(1) - 65;
  if (c1 < 0 || c1 > 25 || c2 < 0 || c2 > 25) return "";
  return String.fromCodePoint(a + c1, a + c2);
}

export const COUNTRY_OPTIONS: { code: string; name: string }[] = [
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },
  { code: "PL", name: "Poland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "IE", name: "Ireland" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "SK", name: "Slovakia" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "BG", name: "Bulgaria" },
  { code: "GR", name: "Greece" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "UA", name: "Ukraine" },
  { code: "OTHER", name: "Other" },
];

/** For "OTHER" we don't show a flag. */
export function getDisplayFlag(code: string | null | undefined): string {
  if (!code || code === "OTHER") return "";
  return getCountryFlagEmoji(code);
}
