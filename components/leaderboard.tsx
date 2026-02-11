import Image from "next/image";
import { getLeaderboard } from "@/lib/leaderboard";
import type { LeaderboardPeriod, LeaderboardRow } from "@/types/runs";
import { LeaderboardTabs } from "./leaderboard-tabs";

function UserAvatar({ row, size = 10 }: { row: LeaderboardRow; size?: number }) {
  const px = size * 4;
  const sizeClass =
    size === 14 ? "h-14 w-14" : size === 12 ? "h-12 w-12" : size === 10 ? "h-10 w-10" : "h-9 w-9";

  if (row.avatarUrl) {
    return (
      <Image
        src={row.avatarUrl}
        alt=""
        width={px}
        height={px}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-blue-100`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700`}
    >
      {row.displayName[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles =
    tier === "Gold"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : tier === "Silver"
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : "bg-orange-50 text-orange-600 border-orange-200";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {tier}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-white shadow-sm">
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white shadow-sm">
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white shadow-sm">
        3
      </div>
    );
  return null;
}

export async function Leaderboard({ period }: { period: LeaderboardPeriod }) {
  const rows = await getLeaderboard(period);

  const periodLabel =
    period === "day" ? "today" : period === "week" ? "this week" : "this month";

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
            <p className="text-sm text-slate-500">
              Compete, earn XP, and climb from Bronze to Gold.
            </p>
          </div>
          <LeaderboardTabs />
        </div>
        <div className="rounded-2xl border border-blue-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No runs yet for {periodLabel}.</p>
          <p className="text-xs text-slate-400">Be the first to log a run!</p>
        </div>
      </div>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-sm text-slate-500">
            Compete, earn XP, and climb from Bronze to Gold.
          </p>
        </div>
        <LeaderboardTabs />
      </div>

      {/* Top 3 podium cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {top3.map((row, i) => {
          const isFirst = i === 0;
          return (
            <div
              key={row.userId}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition-all hover:shadow-lg hover:shadow-blue-100 ${
                isFirst ? "border-blue-300 shadow-md shadow-blue-100" : "border-blue-100"
              }`}
            >
              {/* Rank badge */}
              <div className="absolute right-4 top-4">
                <RankBadge rank={row.rank} />
              </div>

              {/* User info */}
              <div className="mb-4 flex items-center gap-3">
                <UserAvatar row={row} size={14} />
                <div>
                  <p className="font-semibold text-slate-900">{row.displayName}</p>
                  <div className="mt-0.5">
                    <TierBadge tier={row.tier} />
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    XP
                  </p>
                  <p className="text-lg font-bold text-blue-600">+{row.totalXp}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    KM
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {row.totalDistanceKm.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Time
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {row.totalTimeMinutes.toFixed(0)}
                    <span className="text-xs font-normal text-slate-400"> min</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Runs
                  </p>
                  <p className="text-lg font-bold text-slate-900">{row.runsCount}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table for rank 4+ */}
      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rank
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Runner
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tier
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    XP
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    KM
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Runs
                  </th>
                </tr>
              </thead>
              <tbody>
                {rest.map((row, idx) => (
                  <tr
                    key={row.userId}
                    className={`border-b border-blue-50 transition-colors hover:bg-blue-50/50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-500">{row.rank}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar row={row} size={10} />
                        <span className="font-medium text-slate-800">{row.displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <TierBadge tier={row.tier} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-blue-600">
                      {row.totalXp}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">
                      {row.totalDistanceKm.toFixed(1)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">
                      {row.totalTimeMinutes.toFixed(0)}
                      <span className="text-slate-400"> min</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{row.runsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
