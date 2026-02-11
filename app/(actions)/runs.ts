"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateRunXp } from "@/lib/xp";

export async function addRunAction(formData: {
  distance_km: number;
  time_minutes: number;
  date: string; // YYYY-MM-DD
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const { distance_km, time_minutes, date } = formData;

  if (!Number.isFinite(distance_km) || distance_km <= 0) {
    return { error: "Distance must be a positive number." };
  }
  if (!Number.isFinite(time_minutes) || time_minutes < 0) {
    return { error: "Time must be 0 or more (minutes)." };
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Date must be YYYY-MM-DD." };
  }

  const xp = calculateRunXp(distance_km);

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("runs").insert({
    user_id: user.id,
    distance_km,
    time_minutes,
    date,
    xp,
    source: "manual",
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  return {};
}
