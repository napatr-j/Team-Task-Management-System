import { Group } from "@/types/group";
import { createClient } from "@/lib/supabase/server";
import { GroupDetailView } from "@/components/groups/GroupDetailView";

interface GroupPageProps {
  params: {
    id: string;
  };
}

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

export default async function GroupPage({ params }: GroupPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="rounded-[32px] border border-[#E0E0E0] bg-surface p-10 text-center text-textMuted shadow-soft">
        <p className="text-lg font-semibold text-text">Unauthorized</p>
        <p className="mt-2 text-sm">Please sign in to view group details.</p>
      </div>
    );
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id,name,created_at,created_by")
    .eq("id", params.id)
    .single();

  if (teamError || !team) {
    return (
      <div className="rounded-[32px] border border-[#E0E0E0] bg-surface p-10 text-center text-textMuted shadow-soft">
        <p className="text-lg font-semibold text-text">Group not found</p>
        <p className="mt-2 text-sm">Please return to the groups list or try again later.</p>
      </div>
    );
  }

  const { data: teamMembers, error: teamMembersError } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", team.id);

  if (teamMembersError) {
    return (
      <div className="rounded-[32px] border border-[#E0E0E0] bg-surface p-10 text-center text-textMuted shadow-soft">
        <p className="text-lg font-semibold text-text">Unable to load group members</p>
        <p className="mt-2 text-sm">Please try again later.</p>
      </div>
    );
  }

  const userIds = [...new Set(teamMembers?.map((row) => row.user_id) ?? [])];

  const profilesQuery = supabase.from("profiles").select("id,full_name,avatar_url");
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
      email: authUser?.email ?? member.user_id,
      fullName: profile?.full_name ?? undefined,
      role: mapRole(roleRow?.role_id),
      avatarInitials: buildInitials(profile?.full_name ?? authUser?.email),
    };
  }) ?? [];

  const currentUserRoleRow = roleRows?.find((role) => role.user_id === user.id);
  const currentUserRole = mapRole(currentUserRoleRow?.role_id);
  const canManage = currentUserRole === "Admin" || currentUserRole === "Manager";

  const group: Group = {
    id: team.id,
    name: team.name,
    mission: `A detailed view for the ${team.name} collective.`,
    memberCount: members.length,
    members,
    activeProject: "Group Launch",
    createdAt: team.created_at,
    createdBy: team.created_by,
    currentUserRole,
    canManageMembers: canManage,
  };

  return <GroupDetailView group={group} />;
}
