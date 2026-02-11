import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  LeaderboardRow,
  LeaderboardPeriod,
  LeagueTier,
} from "@/types/runs";

function getDateRangeForPeriod(period: LeaderboardPeriod) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (period === "day") {
    // already set to today
  } else if (period === "week") {
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === "month") {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

function getTierForRank(rank: number, total: number): LeagueTier {
  if (total === 0) return "Bronze";

  const percentile = rank / total;

  if (percentile <= 0.2) return "Gold";
  if (percentile <= 0.6) return "Silver";
  return "Bronze";
}

export async function getLeaderboard(
  period: LeaderboardPeriod
): Promise<LeaderboardRow[]> {
  const supabase = getSupabaseServerClient();
  const { start, end } = getDateRangeForPeriod(period);

  const { data, error } = await supabase
    .from("runs")
    .select("user_id, distance_km, time_minutes, xp, date")
    .gte("date", start.toISOString().slice(0, 10))
    .lte("date", end.toISOString().slice(0, 10));

  if (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }

  const byUser = new Map<
    string,
    {
      displayName: string;
      avatarUrl: string | null;
      totalXp: number;
      totalDistanceKm: number;
      totalTimeMinutes: number;
      runsCount: number;
    }
  >();

  for (const row of data ?? []) {
    const current =
      byUser.get(row.user_id) ?? {
        displayName: row.user_id,
        avatarUrl: null,
        totalXp: 0,
        totalDistanceKm: 0,
        totalTimeMinutes: 0,
        runsCount: 0,
      };

    current.totalXp += row.xp;
    current.totalDistanceKm += row.distance_km;
    current.totalTimeMinutes += row.time_minutes;
    current.runsCount += 1;

    byUser.set(row.user_id, current);
  }

  const userIds = Array.from(byUser.keys());

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url")
      .in("id", userIds);

    const profileById = new Map<
      string,
      { nickname: string | null; avatar_url: string | null }
    >();

    for (const profile of profiles ?? []) {
      profileById.set(profile.id, {
        nickname: profile.nickname ?? null,
        avatar_url: profile.avatar_url ?? null,
      });
    }

    for (const [userId, stats] of byUser.entries()) {
      const profile = profileById.get(userId);
      if (profile?.nickname) {
        stats.displayName = profile.nickname;
      } else {
        stats.displayName = userId.slice(0, 8);
      }
      stats.avatarUrl = profile?.avatar_url ?? null;
      byUser.set(userId, stats);
    }
  }

  const entries: LeaderboardRow[] = Array.from(byUser.entries())
    .sort(([, a], [, b]) => b.totalXp - a.totalXp)
    .map(([userId, stats], index, arr) => {
      const rank = index + 1;
      const tier = getTierForRank(rank, arr.length);

      return {
        userId,
        displayName: stats.displayName,
        avatarUrl: stats.avatarUrl,
        rank,
        tier,
        totalXp: stats.totalXp,
        totalDistanceKm: stats.totalDistanceKm,
        totalTimeMinutes: stats.totalTimeMinutes,
        runsCount: stats.runsCount,
      };
    });

  return entries;
}

