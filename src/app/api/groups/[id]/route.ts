import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function buildInitials(fullName: string | null | undefined) {
  const value = fullName?.trim() || "";
  if (!value) return "U";
  const words = value.split(" ");
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function mapRole(roleId: number | null | undefined) {
  if (roleId === 1) return "Admin";
  if (roleId === 2) return "Manager";
  return "Member";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id,name,created_at,created_by")
      .eq("id", id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", team.id);

    if (teamMembersError) {
      return NextResponse.json({ message: "Failed to load group members" }, { status: 500 });
    }

    const userIds = [...new Set(teamMembers?.map((row) => row.user_id) ?? [])];

    const profilesQuery = supabase
      .from("profiles")
      .select("id,email,avatar_url");
    if (userIds.length > 0) {
      profilesQuery.in("id", userIds);
    }
    const { data: profiles } = await profilesQuery;

    const authUsersQuery = supabase.from("auth.users").select("id,email");
    if (userIds.length > 0) {
      authUsersQuery.in("id", userIds);
    }
    const { data: authUsers } = await authUsersQuery;

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("user_id,role_id")
      .eq("team_id", team.id);

    const members = teamMembers?.map((member) => {
      const profile = profiles?.find((item) => item.id === member.user_id);
      const authUser = authUsers?.find((item) => item.id === member.user_id);
      const roleRow = roleRows?.find((role) => role.user_id === member.user_id);
      return {
        id: member.user_id,
        email: authUser?.email ?? profile?.email ?? member.user_id,
        fullName: profile?.email ?? undefined,
        role: mapRole(roleRow?.role_id),
        avatarInitials: buildInitials(authUser?.email ?? profile?.email ?? member.user_id),
      };
    }) ?? [];

    const currentUserRoleRow = roleRows?.find((role) => role.user_id === user.id);
    const currentUserRole = mapRole(currentUserRoleRow?.role_id);
    const canManage = currentUserRole === "Admin" || currentUserRole === "Manager";
    const canDelete = team.created_by === user.id || currentUserRole === "Admin";

    return NextResponse.json(
      {
        id: team.id,
        name: team.name,
        mission: `A detailed view for the ${team.name} collective.`,
        memberCount: members.length,
        members,
        activeProject: "Group Launch",
        createdAt: team.created_at,
        createdBy: team.created_by,
        currentUserRole,
        currentUserId: user.id,
        canManageMembers: canManage,
        canDelete,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to load group details", error: String(error) },
      { status: 500 },
    );
  }
}

