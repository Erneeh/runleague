"use client";

/**
 * Renders a small circular country flag using flag-icons.
 * Use for profile, leaderboard, search results, etc.
 */
export function CountryFlag({
  code,
  className = "",
  size = "sm",
}: {
  code: string | null | undefined;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  if (!code || code.length !== 2 || code === "OTHER") return null;

  const cc = code.toLowerCase();
  const sizeClass =
    size === "xs" ? "w-4 h-4" : size === "md" ? "w-7 h-7" : "w-5 h-5";

  return (
    <span
      className={`fi fis fi-${cc} ${sizeClass} rounded-full overflow-hidden inline-block align-middle shrink-0 ${className}`}
      title={code}
      role="img"
      aria-label={`Flag of ${code}`}
    />
  );
}
