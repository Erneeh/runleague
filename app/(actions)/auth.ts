"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function signOutAction() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

/** Call after signUp to create/update profile with nickname (server-side, avoids RLS issues). */
export async function createProfileAfterSignUp(nickname: string | null) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const newNickname = nickname?.trim() || null;
  if (existing) {
    if (existing.nickname != null && existing.nickname !== "") {
      revalidatePath("/");
      revalidatePath("/profile");
      return {};
    }
    const { error } = await supabase
      .from("profiles")
      .update({ nickname: newNickname })
      .eq("id", user.id)
      .select("id")
      .single();
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      nickname: newNickname,
    });
    if (error) return { error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/profile");
  return {};
}

