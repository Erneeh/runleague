import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { exchangeStravaToken } from "@/lib/strava";
import { syncStravaRunsForUser } from "@/lib/stravaSync";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/profile?strava=error", req.url));
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const token = await exchangeStravaToken(code);

    if (!token.athlete?.id) {
      return NextResponse.redirect(
        new URL("/profile?strava=error&msg=no_athlete", req.url)
      );
    }

    // Check if this Strava athlete is already connected to a different user
    const { data: existingConnection } = await supabase
      .from("strava_connections")
      .select("user_id")
      .eq("athlete_id", token.athlete.id)
      .maybeSingle();

    if (existingConnection && existingConnection.user_id !== user.id) {
      return NextResponse.redirect(
        new URL("/profile?strava=error&msg=already_connected", req.url)
      );
    }

    const expiresAtIso = new Date(token.expires_at * 1000).toISOString();

    const stravaAvatar =
      (token as any).athlete?.profile_medium ??
      (token as any).athlete?.profile ??
      null;

    const { error: connectionError } = await supabase
      .from("strava_connections")
      .upsert(
        {
          user_id: user.id,
          athlete_id: token.athlete.id,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expires_at: expiresAtIso,
          avatar_url: stravaAvatar,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (connectionError) {
      console.error("Error saving Strava connection:", connectionError);
      return NextResponse.redirect(
        new URL("/profile?strava=error&msg=save_failed", req.url)
      );
    }

    if (stravaAvatar) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile?.avatar_url) {
        await supabase.from("profiles").upsert({
          id: user.id,
          avatar_url: stravaAvatar,
        });
      }
    }

    // Kick off a sync of recent runs (best-effort)
    await syncStravaRunsForUser(user.id);

    return NextResponse.redirect(
      new URL("/profile?strava=connected", req.url)
    );
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(new URL("/profile?strava=error", req.url));
  }
}

