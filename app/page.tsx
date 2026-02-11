import { Leaderboard } from "@/components/leaderboard";
import { getCurrentUser } from "@/lib/auth";
import { ensureProfileExists } from "@/lib/profile";
import type { LeaderboardPeriod } from "@/types/runs";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    await ensureProfileExists(user.id, user.user_metadata, user.email);
  }

  const period: LeaderboardPeriod =
    params.period === "day" || params.period === "month" ? params.period : "week";

  return <Leaderboard period={period} />;
}
