"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function updateProfileAction(formData: {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  nickname?: string | null;
  country_code?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.first_name ?? null,
      last_name: formData.last_name ?? null,
      phone: formData.phone ?? null,
      nickname: formData.nickname ?? null,
      country_code: formData.country_code ?? null,
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (!data) {
    return {
      error:
        "Profile could not be updated. In Supabase, ensure the profiles table has an RLS policy allowing UPDATE where id = auth.uid().",
    };
  }

  revalidatePath("/profile", "layout");
  revalidatePath("/");
  return {};
}
