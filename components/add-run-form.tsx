"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addRunAction } from "@/app/(actions)/runs";

export function AddRunForm() {
  const router = useRouter();
  const [distance, setDistance] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const distanceNum = parseFloat(distance.replace(",", "."));
    const timeNum = parseFloat(timeMinutes.replace(",", "."));

    if (Number.isNaN(distanceNum) || Number.isNaN(timeNum)) {
      setError("Please enter valid numbers.");
      return;
    }

    setSaving(true);
    const result = await addRunAction({
      distance_km: distanceNum,
      time_minutes: timeNum,
      date,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setDistance("");
    setTimeMinutes("");
    setDate(new Date().toISOString().slice(0, 10));
    router.refresh();
  };

  const inputClass =
    "w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white";

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-50">
      <h2 className="mb-4 text-sm font-bold text-slate-900">Log a run</h2>
      <p className="mb-4 text-xs text-slate-500">
        Add a run manually. XP = distance (km) × 10. It will show on the leaderboard.
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Run added successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Distance (km)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={inputClass}
            placeholder="5.2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Time (minutes)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(e.target.value)}
            className={inputClass}
            placeholder="28"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add run"}
        </button>
      </form>
    </div>
  );
}
