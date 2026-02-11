import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { getStravaAuthorizeUrl } from "@/lib/strava";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProfilePersonalInfo } from "@/components/profile-personal-info";
import { AddRunForm } from "@/components/add-run-form";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ strava?: string; msg?: string }>;
}) {
  const user = await getCurrentUser();
  const stravaUrl = getStravaAuthorizeUrl();
  const params = await searchParams;

  const supabase = getSupabaseServerClient();

  const [{ data: profile }, { data: connection }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, avatar_url, first_name, last_name, phone")
      .eq("id", user?.id || "")
      .maybeSingle(),
    supabase
      .from("strava_connections")
      .select("athlete_id, avatar_url")
      .eq("user_id", user?.id || "")
      .maybeSingle(),
  ]);

  const metadata = (user?.user_metadata || {}) as Record<string, string | undefined>;
  const displayName =
    profile?.nickname ??
    user?.user_metadata?.full_name ??
    (profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : null) ??
    user?.email?.split("@")[0] ??
    "Runner";

  const avatarUrl =
    profile?.avatar_url ??
    (user?.user_metadata as any)?.avatar_url ??
    null;

  const firstName = profile?.first_name ?? metadata?.given_name ?? null;
  const lastName = profile?.last_name ?? metadata?.family_name ?? null;
  const phone = profile?.phone ?? null;
  const email = user?.email ?? null;
  const nickname = profile?.nickname ?? null;

  return (
    <div className="mx-auto mt-6 max-w-md space-y-4">
      {/* Profile card */}
      <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-50">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-200"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-slate-900">{displayName}</h1>
          <p className="text-sm text-slate-500">
            Signed in as{" "}
            <span className="font-medium text-slate-700">
              {user?.email ?? "Unknown"}
            </span>
          </p>
        </div>
      </div>

      {/* Personal info */}
      <ProfilePersonalInfo
        email={email}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        nickname={nickname}
      />

      {/* Log a run */}
      <AddRunForm />

      {/* Strava card */}
      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-50">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          Strava connection
          {connection?.avatar_url && (
            <Image
              src={connection.avatar_url}
              alt="Strava avatar"
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover"
            />
          )}
        </h2>

        {params.strava === "connected" && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Successfully connected to Strava!
          </div>
        )}

        {params.strava === "error" && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.msg === "already_connected"
              ? "This Strava account is already connected to another user."
              : params.msg === "save_failed"
              ? "Failed to save connection. Please try again."
              : "Failed to connect Strava. Please try again."}
          </div>
        )}

        {connection ? (
          <>
            <p className="mb-3 text-sm text-slate-500">
              Connected to Strava. Recent runs will be synced automatically.
            </p>
            <p className="mb-3 text-xs text-slate-400">
              Athlete ID:{" "}
              <span className="font-mono text-slate-600">
                {connection.athlete_id ?? "Unknown"}
              </span>
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Connected
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Connect your Strava account to automatically sync your runs and
              update your RunLeague XP and leaderboards.
            </p>
            <a
              href={stravaUrl}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
            >
              Connect Strava
            </a>
          </>
        )}
      </div>
    </div>
  );
}
