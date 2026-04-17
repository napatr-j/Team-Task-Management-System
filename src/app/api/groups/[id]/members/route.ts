import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", id);

    if (membersError || !members) {
      return NextResponse.json({ message: "Unable to load members" }, { status: 500 });
    }

    const memberIds = Array.from(new Set(members.map((member) => member.user_id)));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,avatar_url,email")
      .in("id", memberIds);

    const profileMap = (profiles ?? []).reduce<Record<string, { avatarUrl?: string; email?: string }>>((acc, profile) => {
      acc[profile.id] = {
        avatarUrl: profile.avatar_url ?? undefined,
        email: profile.email ?? undefined,
      };
      return acc;
    }, {});

    const { data: authUsers } = await supabase
      .from("auth.users")
      .select("id,email")
      .in("id", memberIds);

    const authMap = (authUsers ?? []).reduce<Record<string, { email?: string }>>((acc, userRow) => {
      acc[userRow.id] = { email: userRow.email ?? undefined };
      return acc;
    }, {});

    const { data: currentUserRole, error: currentUserRoleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    const canCreateTasks =
      !currentUserRoleError &&
      currentUserRole &&
      (currentUserRole.role_id === 1 || currentUserRole.role_id === 2);

    const result = memberIds.map((memberId) => ({
      id: memberId,
      email: profileMap[memberId]?.email ?? authMap[memberId]?.email ?? null,
      avatarUrl: profileMap[memberId]?.avatarUrl ?? null,
    }));

    return NextResponse.json({ members: result, canCreateTasks });
  } catch (error) {
    return NextResponse.json({ message: "Unable to load members", error: String(error) }, { status: 500 });
  }
}
