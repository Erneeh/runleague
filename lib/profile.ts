import { getSupabaseServerClient } from "@/lib/supabase/server";

export function generateNicknameFromGoogleUser(user: {
  user_metadata?: {
    full_name?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
  };
  email?: string | null;
}): string {
  const metadata = user.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || "";
  const firstName = metadata.given_name || "";
  const lastName = metadata.family_name || "";

  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length > 0) return parts[0];
  }

  if (firstName && lastName) {
    const firstPart = firstName.slice(0, 3).toLowerCase();
    const lastPart = lastName.slice(0, 3).toLowerCase();
    return `${firstPart}${lastPart}`;
  }

  if (firstName) return firstName;
  if (user.email) return user.email.split("@")[0];
  return "";
}

export async function ensureProfileExists(
  userId: string,
  userMetadata?: any,
  userEmail?: string | null
) {
  const supabase = getSupabaseServerClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("nickname, first_name, last_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const metadata = userMetadata || {};
  const avatarFromMeta =
    typeof metadata.avatar_url === "string" && metadata.avatar_url.trim()
      ? metadata.avatar_url.trim()
      : null;

  if (!existingProfile) {
    const givenName = metadata.given_name ?? null;
    const familyName = metadata.family_name ?? null;
    let nickname: string | null = null;
    if (metadata.nickname && typeof metadata.nickname === "string") {
      nickname = metadata.nickname.trim();
    } else if (userMetadata) {
      const generated = generateNicknameFromGoogleUser({
        user_metadata: userMetadata,
        email: userEmail,
      });
      if (generated) nickname = generated;
    }
    if (!nickname && userEmail) nickname = userEmail.split("@")[0];

    await supabase.from("profiles").upsert({
      id: userId,
      nickname: nickname || null,
      first_name: givenName || null,
      last_name: familyName || null,
      avatar_url: avatarFromMeta || null,
    });
    return;
  }

  const updates: {
    nickname?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } = {};
  if (existingProfile.nickname == null || existingProfile.nickname === "") {
    let nickname: string | null = null;
    if (metadata.nickname && typeof metadata.nickname === "string") {
      nickname = metadata.nickname.trim();
    } else if (userMetadata) {
      const generated = generateNicknameFromGoogleUser({
        user_metadata: userMetadata,
        email: userEmail,
      });
      if (generated) nickname = generated;
    }
    if (!nickname && userEmail) nickname = userEmail.split("@")[0];
    if (nickname) updates.nickname = nickname;
  }
  if (existingProfile.first_name == null || existingProfile.first_name === "") {
    const v = metadata.given_name ?? null;
    if (v) updates.first_name = v;
  }
  if (existingProfile.last_name == null || existingProfile.last_name === "") {
    const v = metadata.family_name ?? null;
    if (v) updates.last_name = v;
  }
  if (
    (existingProfile.avatar_url == null || existingProfile.avatar_url === "") &&
    avatarFromMeta
  ) {
    updates.avatar_url = avatarFromMeta;
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
  }
}
