"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { LeaderboardPeriod } from "@/types/runs";

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

export function LeaderboardTabs() {
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as LeaderboardPeriod) || "week";

  return (
    <div className="flex gap-1 rounded-xl border border-blue-200 bg-blue-50/50 p-1">
      {PERIODS.map(({ value, label }) => {
        const isActive = current === value;
        return (
          <Link
            key={value}
            href={value === "week" ? "/" : `/?period=${value}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "text-slate-500 hover:bg-blue-100 hover:text-blue-700"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
