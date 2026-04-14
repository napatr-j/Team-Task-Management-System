import { NextResponse } from "next/server";
import type { TimeFilter } from "@/types/dashboard";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getBadge(priority: string, status: string) {
  if (priority === "high") {
    return "urgent";
  }

  if (status === "in_progress") {
    return "meeting";
  }

  if (priority === "low") {
    return "review";
  }

  return "drafting";
}

function getRange(filter: TimeFilter) {
  const start = new Date();
  const tomorrow = new Date(start);
  tomorrow.setDate(start.getDate() + 1);
  const nextWeek = new Date(start);
  nextWeek.setDate(start.getDate() + 7);

  if (filter === "overdue") {
    return { lt: start.toISOString() };
  }

  if (filter === "tomorrow") {
    return { gte: start.toISOString(), lt: tomorrow.toISOString() };
  }

  if (filter === "next_week") {
    return { gte: tomorrow.toISOString(), lt: nextWeek.toISOString() };
  }

  if (filter === "in_progress") {
    return { gte: start.toISOString() };
  }

  return { gte: nextWeek.toISOString() };
}

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

type AssigneeRow = { task_id: string; user_id: string };
type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null };

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
    .select("id,full_name,avatar_url")
    .in("id", userIds)) as PostgrestResponse<ProfileRow>;

  if (profileError || !profiles) {
    return {} as Record<string, Array<{ id: string; avatarUrl?: string; initials?: string }>>;
  }

  const profileMap = profiles.reduce<Record<string, { id: string; avatarUrl?: string; initials?: string }>>(
    (map, profile) => {
      const initials = profile.full_name
        ? profile.full_name
            .split(" ")
            .map((part: string) => part[0])
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
  const filter = (url.searchParams.get("filter") as TimeFilter) ?? "tomorrow";
  const groupId = url.searchParams.get("group");
  const range = getRange(filter);

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
  const taskQuery = supabase.from("tasks").select("id,title,description,deadline,priority,status").neq("status", "done");

  if (validGroupId) {
    taskQuery.eq("team_id", validGroupId);
  } else if (teamIds.length) {
    taskQuery.in("team_id", teamIds);
  } else {
    return NextResponse.json([]);
  }

  taskQuery.order("deadline", { ascending: true });

  if (range.gte) {
    taskQuery.gte("deadline", range.gte);
  }

  if (range.lt) {
    taskQuery.lt("deadline", range.lt);
  }

  const result = (await taskQuery) as PostgrestResponse<{
    id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    priority: string | null;
    status: string | null;
  }>;

  const rawTasks = result.data ?? [];
  const taskIds = rawTasks.map((task) => task.id);
  const assigneeMap = await getTaskAssignees(supabase, taskIds);

  const tasks = rawTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    dueDate: task.deadline ?? new Date().toISOString(),
    badge: getBadge(task.priority ?? "", task.status ?? ""),
    assignees: assigneeMap[task.id] ?? [],
    completed: task.status === "done",
  }));

  if (result.error) {
    return NextResponse.json({ message: "Failed to load tasks" }, { status: 500 });
  }

  return NextResponse.json(tasks);
}
