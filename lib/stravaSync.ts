import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calculateRunXp } from "@/lib/xp";
import {
  fetchStravaActivities,
  refreshStravaToken,
} from "@/lib/strava";

export async function syncStravaRunsForUser(userId: string) {
  const supabase = getSupabaseServerClient();

  const { data: connection, error } = await supabase
    .from("strava_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !connection) {
    return;
  }

  let { access_token, refresh_token, expires_at } = connection as unknown as {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const expiresSec = Math.floor(new Date(expires_at).getTime() / 1000);

  if (expiresSec <= nowSec + 60) {
    const refreshed = await refreshStravaToken(refresh_token);
    access_token = refreshed.access_token;
    refresh_token = refreshed.refresh_token;

    const newExpires = new Date(refreshed.expires_at * 1000).toISOString();

    await supabase
      .from("strava_connections")
      .update({
        access_token,
        refresh_token,
        expires_at: newExpires,
      })
      .eq("user_id", userId);
  }

  const activities = await fetchStravaActivities(access_token);

  const runs = activities.filter((a) => a.type === "Run");

  if (!runs.length) return;

  const rows = runs.map((activity) => {
    const distanceKm = activity.distance / 1000;
    const timeMinutes = activity.moving_time / 60;
    const date = activity.start_date_local.slice(0, 10);

    return {
      user_id: userId,
      distance_km: distanceKm,
      time_minutes: timeMinutes,
      date,
      elevation_gain: activity.total_elevation_gain,
      xp: calculateRunXp(distanceKm),
      source: "strava",
      source_activity_id: String(activity.id),
    };
  });

  await supabase.from("runs").upsert(rows, {
    onConflict: "source_activity_id",
  });
}

