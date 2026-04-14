import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

export async function ensureUserProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return;
  }

  const email = user.email ?? null;
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  const profileResult = await supabase
    .from("profiles")
    .select("email,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const existingProfile = profileResult.data as
    | { email: string | null; avatar_url: string | null }
    | null;

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email,
      avatar_url: avatarUrl,
    });
    return;
  }
  const profileUpdate: Record<string, string | null> = {
    id: user.id,
    email,
    avatar_url: existingProfile.avatar_url ?? avatarUrl,
  };

  if (avatarUrl && avatarUrl !== existingProfile.avatar_url) {
    profileUpdate.avatar_url = avatarUrl;
  }

  if (email !== existingProfile.email) {
    profileUpdate.email = email;
  }

  await supabase.from("profiles").upsert(profileUpdate);
}
