"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function updateProfileAction(formData: {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  nickname?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.first_name ?? null,
      last_name: formData.last_name ?? null,
      phone: formData.phone ?? null,
      nickname: formData.nickname ?? null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return {};
}
