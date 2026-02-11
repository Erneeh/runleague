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
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    nickname: nickname?.trim() || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/profile");
  return {};
}

