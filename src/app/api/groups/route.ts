import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const roleIdMap = {
  Admin: 1,
  Manager: 2,
  Member: 3,
} as const;

type GroupRoleName = keyof typeof roleIdMap;

const invitedMemberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["Manager", "Member"]),
});

const createGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  mission: z.string().max(300).optional(),
  members: z.array(invitedMemberSchema).optional(),
});

function buildInitials(value: string | null | undefined) {
  const v = value?.trim() || "";
  if (!v) return "U";
  const words = v.split(" ");
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function mapRole(roleId: number | null | undefined) {
  if (roleId === 1) return "Admin";
  if (roleId === 2) return "Manager";
  return "Member";
}

/* ================== GET ================== */

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    if (membershipError) {
      return NextResponse.json({ message: "Failed to load groups" }, { status: 500 });
    }

    const teamIds =
      memberships?.map((membership) => membership.team_id).filter(Boolean) ?? [];

    if (teamIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select("id,name,created_at,created_by")
      .in("id", teamIds);

    if (teamError || !teams) {
      return NextResponse.json({ message: "Failed to load groups" }, { status: 500 });
    }

    const { data: teamMemberRows, error: teamMemberError } = await supabase
      .from("team_members")
      .select("team_id,user_id")
      .in("team_id", teamIds);

    if (teamMemberError) {
      return NextResponse.json({ message: "Failed to load group members" }, { status: 500 });
    }

    const userIds = [
      ...new Set(teamMemberRows?.map((item) => item.user_id) ?? []),
    ];

    // ✅ เอา full_name ออกแล้ว
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,email,avatar_url")
      .in("id", userIds);

    const { data: authUsers } = await supabase
      .from("auth.users")
      .select("id,email")
      .in("id", userIds);

    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id,team_id,role_id")
      .in("team_id", teamIds);

    if (roleError) {
      return NextResponse.json({ message: "Failed to load roles" }, { status: 500 });
    }

    const groups = teams.map((team) => {
      const teamMembers =
        teamMemberRows?.filter((member) => member.team_id === team.id) ?? [];

      const members = teamMembers.map((member) => {
        const profile = profiles?.find((item) => item.id === member.user_id);
        const authUser = authUsers?.find((item) => item.id === member.user_id);
        const roleRow = roleRows?.find(
          (role) => role.team_id === team.id && role.user_id === member.user_id
        );

        const email = authUser?.email ?? profile?.email ?? member.user_id;

        return {
          id: member.user_id,
          email,
          role: mapRole(roleRow?.role_id),
          avatarInitials: buildInitials(email),
        };
      });

      const currentUserRoleRow = roleRows?.find(
        (role) => role.team_id === team.id && role.user_id === user.id
      );

      const currentUserRole = mapRole(currentUserRoleRow?.role_id);
      const canManage = currentUserRole === "Admin" || currentUserRole === "Manager";
      const canDelete = team.created_by === user.id || currentUserRole === "Admin";

      return {
        id: team.id,
        name: team.name,
        mission: `A collaborative workspace for the ${team.name} collective.`,
        memberCount: teamMembers.length,
        members,
        activeProject: "Launch Plan",
        createdAt: team.created_at,
        createdBy: team.created_by,
        currentUserRole,
        currentUserId: user.id,
        canManageMembers: canManage,
        canDelete,
      };
    });

    return NextResponse.json(groups, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Unexpected error loading groups", error: String(error) },
      { status: 500 }
    );
  }
}

/* ================== POST ================== */

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = createGroupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid payload", errors: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, mission, members = [] } = parseResult.data;

    const uniqueMemberIds = [
      ...new Set(
        members.map((m) => m.id).filter((id) => id !== user.id)
      ),
    ];

    if (uniqueMemberIds.length > 0) {
      const { data: existingProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .in("id", uniqueMemberIds);

      if (profilesError) {
        return NextResponse.json(
          { message: "Failed to verify invited users", error: profilesError.message },
          { status: 500 }
        );
      }

      const existingIds = existingProfiles?.map((p) => p.id) ?? [];

      const missingUser = uniqueMemberIds.find(
        (id) => !existingIds.includes(id)
      );

      if (missingUser) {
        return NextResponse.json(
          { message: `Invited user not found: ${missingUser}` },
          { status: 400 }
        );
      }
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name,
        created_by: user.id,
      })
      .select("id,name,created_at,created_by")
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { message: "Failed to create group", error: teamError?.message },
        { status: 500 }
      );
    }

    const teamMemberRows = [
      { team_id: team.id, user_id: user.id },
      ...uniqueMemberIds.map((id) => ({
        team_id: team.id,
        user_id: id,
      })),
    ];

    const { error: teamMembersError } = await supabase
      .from("team_members")
      .insert(teamMemberRows);

    if (teamMembersError) {
      return NextResponse.json(
        { message: "Failed to add group members", error: teamMembersError.message },
        { status: 500 }
      );
    }

    const roleRows = [
      { user_id: user.id, team_id: team.id, role_id: roleIdMap.Admin },
      ...members.map((member) => ({
        user_id: member.id,
        team_id: team.id,
        role_id: roleIdMap[member.role],
      })),
    ];

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert(roleRows);

    if (roleError) {
      return NextResponse.json(
        { message: "Failed to assign roles", error: roleError.message },
        { status: 500 }
      );
    }

    const createdGroup = {
      id: team.id,
      name: team.name,
      mission: mission || "A new team collaboration space.",
      memberCount: 1 + uniqueMemberIds.length,
      members: [
        {
          id: user.id,
          email: user.email ?? "",
          role: "Admin" as const,
          avatarInitials: buildInitials(user.email),
        },
        ...members.map((member) => ({
          id: member.id,
          email: member.email,
          role: member.role,
          avatarInitials: buildInitials(member.email),
        })),
      ],
      activeProject: "Group Assembly",
      createdAt: team.created_at,
      createdBy: team.created_by,
      currentUserRole: "Admin" as const,
      canManageMembers: true,
      canDelete: true,
    };

    return NextResponse.json(createdGroup, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { message: "Unexpected error creating group", error: String(error) },
      { status: 500 }
    );
  }
}