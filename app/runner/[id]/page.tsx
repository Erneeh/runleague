import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CountryFlag } from "@/components/country-flag";

export default async function RunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, nickname, first_name, last_name, avatar_url, country_code")
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const displayName =
    profile.nickname?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
    "Runner";

  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-50">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-blue-200"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {displayName[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2 sm:justify-start">
              {displayName}
              {profile.country_code && (
                <CountryFlag code={profile.country_code} size="md" />
              )}
            </h1>
            {(profile.first_name || profile.last_name) && profile.nickname && (
              <p className="mt-0.5 text-sm text-slate-500">
                {[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
              </p>
            )}
            <Link
              href="/"
              className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View on leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
