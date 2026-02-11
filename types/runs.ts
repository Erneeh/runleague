export type LeagueTier = "Bronze" | "Silver" | "Gold";

export type LeaderboardPeriod = "day" | "week" | "month";

export interface LeaderboardRow {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  totalDistanceKm: number;
  totalTimeMinutes: number;
  runsCount: number;
  rank: number;
  tier: LeagueTier;
}

