"use client";

import Image from "next/image";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TopBarProps {
  pageLabel?: string;
  pageTitle?: string;
}

export default function TopBar({
  pageLabel = "Dashboard",
  pageTitle = "Project overview",
}: TopBarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("ME");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (error || !user) {
        return;
      }

      const userMetadata = user.user_metadata as Record<string, unknown> | undefined;
      const userData = user as Record<string, any>;
      const picture =
        (typeof userMetadata?.avatar_url === "string" && userMetadata.avatar_url) ||
        (typeof userMetadata?.picture === "string" && userMetadata.picture) ||
        (Array.isArray(userData.identities) &&
          typeof userData.identities[0]?.identity_data?.picture === "string" &&
          userData.identities[0].identity_data.picture) ||
        null;

      if (typeof picture === "string") {
        setAvatarUrl(picture);
      } else {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (!profileError && profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }

      const email = user.email ?? "";
      const namePart = email.split("@")[0] || "ME";
      const initialsValue = namePart
        .split(/[\.\-_ ]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      setInitials(initialsValue || "ME");
    }

    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[#ECECEC] bg-team-surface/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-team-olive/90">Dashboard</p>
          <h1 className="text-2xl font-semibold text-team-text">Project overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-team-bg text-team-text shadow-sm transition-colors duration-200 hover:bg-team-olive/10"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <div className="relative group">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-team-bg text-team-text shadow-sm"
              aria-label="User profile"
            >
              {avatarUrl ? (
                <Image
                  alt="User avatar"
                  src={avatarUrl}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">{initials}</span>
              )}
            </button>
            <div className="invisible absolute right-0 top-full z-10 mt-2 w-36 rounded-2xl border border-[#E5E7EB] bg-team-surface p-2 text-sm shadow-soft transition-all duration-200 group-hover:visible group-focus-within:visible">
              <button
                type="button"
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-team-text transition-colors duration-200 hover:bg-team-olive/10"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
