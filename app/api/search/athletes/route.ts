import { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type AthleteSearchHit = {
  id: string;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return Response.json({ athletes: [] });
  }

  const supabase = getSupabaseServerClient();

  const pattern = `%${q}%`;
  const cols = "id, nickname, first_name, last_name, avatar_url, country_code";

  const [r1, r2, r3] = await Promise.all([
    supabase.from("profiles").select(cols).ilike("nickname", pattern).limit(5),
    supabase.from("profiles").select(cols).ilike("first_name", pattern).limit(5),
    supabase.from("profiles").select(cols).ilike("last_name", pattern).limit(5),
  ]);

  type Row = { id: string; nickname: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null; country_code: string | null };
  const seen = new Set<string>();
  const rows: Row[] = [];
  for (const r of [r1, r2, r3]) {
    for (const row of (r.data ?? []) as Row[]) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        rows.push(row);
      }
    }
  }

  const athletes: AthleteSearchHit[] = rows.slice(0, 10).map((row) => ({
    id: row.id,
    nickname: row.nickname ?? null,
    first_name: row.first_name ?? null,
    last_name: row.last_name ?? null,
    avatar_url: row.avatar_url ?? null,
    country_code: row.country_code ?? null,
  }));

  return Response.json({ athletes });
}
