import { NextResponse } from "next/server";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type AssigneeRow = { task_id: string; user_id: string };
type ProfileRow = { id: string; email: string | null; avatar_url: string | null };

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: string | null;
  status: string | null;
  team_id: string | null;
};

async function getTeamIds(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.team_id);
}

async function getTaskAssignees(supabase: Awaited<ReturnType<typeof createClient>>, taskIds: string[]) {
  if (taskIds.length === 0) {
    return {} as Record<string, Array<{ id: string; avatarUrl?: string; initials?: string }>>;
  }

  const { data: assigneeRows, error: assigneeError } = (await supabase
    .from("task_assignees")
    .select("task_id,user_id")
    .in("task_id", taskIds)) as PostgrestResponse<AssigneeRow>;

  if (assigneeError || !assigneeRows) {
    return {} as Record<string, Array<{ id: string; avatarUrl?: string; initials?: string }>>;
  }

  const userIds = Array.from(new Set(assigneeRows.map((row) => row.user_id)));
  const { data: profiles, error: profileError } = (await supabase
    .from("profiles")
    .select("id,email,avatar_url")
    .in("id", userIds)) as PostgrestResponse<ProfileRow>;

  if (profileError || !profiles) {
    return {} as Record<string, Array<{ id: string; avatarUrl?: string; initials?: string }>>;
  }

  const profileMap = profiles.reduce<Record<string, { id: string; avatarUrl?: string; initials?: string }>>(
    (map, profile) => {
      const initials = profile.email
        ? profile.email
            .split("@")[0]
            .split(/\W+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : undefined;
      map[profile.id] = {
        id: profile.id,
        avatarUrl: profile.avatar_url ?? undefined,
        initials,
      };
      return map;
    },
    {},
  );

  return assigneeRows.reduce<Record<string, Array<{ id: string; avatarUrl?: string; initials?: string }>>>(
    (map, row) => {
      const profile = profileMap[row.user_id];
      if (!profile) {
        return map;
      }

      if (!map[row.task_id]) {
        map[row.task_id] = [];
      }

      map[row.task_id].push(profile);
      return map;
    },
    {},
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const groupId = url.searchParams.get("group");
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const teamIds = await getTeamIds(supabase, user.id);
  const validGroupId = groupId && teamIds.includes(groupId) ? groupId : undefined;
  const now = new Date().toISOString();

  if (!validGroupId && teamIds.length === 0) {
    return NextResponse.json([]);
  }

  let query = supabase
    .from("tasks")
    .select("id,title,description,deadline,priority,status,team_id")
    .lt("deadline", now)
    .neq("status", "done")
    .order("deadline", { ascending: false });

  if (validGroupId) {
    query = query.eq("team_id", validGroupId);
  } else {
    query = query.in("team_id", teamIds);
  }

  const result = (await query) as PostgrestResponse<TaskRow>;

  if (result.error || !result.data) {
    return NextResponse.json({ message: "Failed to load overdue tasks" }, { status: 500 });
  }

  const rawTasks = result.data;
  const taskIds = rawTasks.map((task) => task.id);
  const assigneeMap = await getTaskAssignees(supabase, taskIds);

  const teamIdsForNames = Array.from(new Set(rawTasks.map((task) => task.team_id).filter((id): id is string => Boolean(id))));
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("id,name")
    .in("id", teamIdsForNames);

  const teamMap = (teams || []).reduce<Record<string, string>>((map, team) => {
    map[team.id] = team.name;
    return map;
  }, {});

  const tasks = rawTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    dueDate: task.deadline ?? new Date().toISOString(),
    badge: task.priority === "high" ? "urgent" : task.status === "in_progress" ? "meeting" : "drafting",
    assignees: assigneeMap[task.id] ?? [],
    completed: task.status === "done",
    groupName: task.team_id ? teamMap[task.team_id] ?? "Group" : "Group",
    status: task.status ?? "unknown",
  }));

  if (teamError) {
    return NextResponse.json({ message: "Failed to load overdue task groups" }, { status: 500 });
  }

  return NextResponse.json(tasks);
}
