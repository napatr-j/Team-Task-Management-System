import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type TaskAssigneeProfile = { id: string; avatarUrl?: string; initials?: string; email?: string };
type TaskAssigneeMap = Record<string, TaskAssigneeProfile[]>;
type ChildTask = {
  id: string;
  title: string;
  status: string;
  parent_task_id?: string | null;
};
type ChildTaskMap = Record<string, ChildTask[]>;
type CreatedChildTask = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: string;
  status: string;
  assignees: TaskAssigneeProfile[];
};

type TaskRows = Array<{ id: string; title: string; description: string | null; deadline: string | null; priority: string | null; status: string | null; created_by: string | null }>;

async function getTaskAssignees(supabase: any, taskIds: string[]): Promise<TaskAssigneeMap> {
  if (taskIds.length === 0) return {};

  const { data: rows, error: rowError } = await supabase
    .from("task_assignees")
    .select("task_id,user_id")
    .in("task_id", taskIds);

  if (rowError || !rows) return {};

  const userIds = Array.from(new Set(rows.map((row: { user_id: string }) => row.user_id)));
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,avatar_url")
    .in("id", userIds);

  if (profileError || !profiles) return {};

  const profileMap = profiles.reduce((acc: Record<string, TaskAssigneeProfile>, profile: { id: string; email?: string | null; avatar_url?: string | null }) => {
    const initials = profile.email
      ? profile.email
          .split("@")[0]
          .split(/\W+/)
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : undefined;

    acc[profile.id] = {
      id: profile.id,
      avatarUrl: profile.avatar_url ?? undefined,
      initials,
      email: profile.email ?? undefined,
    };
    return acc;
  }, {});

  const initial: TaskAssigneeMap = {};
  return rows.reduce((acc: TaskAssigneeMap, row: { task_id: string; user_id: string }) => {
    const profile = profileMap[row.user_id];
    if (!profile) return acc;
    if (!acc[row.task_id]) acc[row.task_id] = [];
    acc[row.task_id].push(profile);
    return acc;
  }, initial);
}

async function getChildTasks(supabase: any, taskIds: string[]): Promise<ChildTaskMap> {
  if (taskIds.length === 0) return {};

  const { data: childTasks, error } = await supabase
    .from("tasks")
    .select("id,parent_task_id,title,status")
    .in("parent_task_id", taskIds);

  if (error || !childTasks) return {};

  return (childTasks as Array<{ id: string; parent_task_id: string; title: string; status: string }>).reduce(
    (acc: ChildTaskMap, child) => {
      const parentId = child.parent_task_id;
      if (!parentId) return acc;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push({
        id: child.id,
        title: child.title,
        status: child.status,
        parent_task_id: child.parent_task_id,
      });
      return acc;
    },
    {},
  );
}

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

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id,title,description,deadline,priority,status,created_by,created_at")
      .eq("team_id", id)
      .order("deadline", { ascending: true });

    if (error) {
      return NextResponse.json({ message: "Unable to load tasks" }, { status: 500 });
    }

    const taskRows = tasks ?? [];
    const taskIds = taskRows.map((task) => task.id);
    const assigneeMap = await getTaskAssignees(supabase, taskIds);
    const childTaskMap = await getChildTasks(supabase, taskIds);

    return NextResponse.json({
      tasks: taskRows.map((task) => ({
        ...task,
        description: task.description ?? "",
        deadline: task.deadline ?? null,
        priority: task.priority ?? "medium",
        status: task.status ?? "todo",
        assignees: assigneeMap[task.id] ?? [],
        subtasks: childTaskMap[task.id] ?? [],
      })),
    });
  } catch (error) {
    return NextResponse.json({ message: "Unable to load tasks", error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, description, deadline, priority, status, assigneeIds, subtasks } = body;
    if (!title) {
      return NextResponse.json({ message: "Task title is required" }, { status: 400 });
    }

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

    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleRow || ![1, 2].includes(roleRow.role_id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          description: description ?? null,
          deadline: deadline ?? null,
          priority: priority ?? "medium",
          status: status ?? "todo",
          team_id: id,
          created_by: user.id,
          parent_task_id: body.parentTaskId ?? null,
        },
      ])
      .select()
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ message: "Unable to create task" }, { status: 500 });
    }

    const assignees: Array<{ id: string; avatarUrl?: string; initials?: string; email?: string }> = [];
    if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      const { error: assignError } = await supabase.from("task_assignees").insert(
        assigneeIds.map((userId: string) => ({ task_id: inserted.id, user_id: userId })),
      );

      if (assignError) {
        return NextResponse.json({ message: "Unable to assign task users", error: assignError.message }, { status: 500 });
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id,email,avatar_url")
        .in("id", assigneeIds);

      if (!profileError && profiles) {
        profiles.forEach((profile: { id: string; email?: string | null; avatar_url?: string | null }) => {
          const initials = profile.email
            ? profile.email
                .split("@")[0]
                .split(/\W+/)
                .map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : undefined;
          assignees.push({
            id: profile.id,
            avatarUrl: profile.avatar_url ?? undefined,
            initials,
            email: profile.email ?? undefined,
          });
        });
      }
    }

    const createdSubtasks: CreatedChildTask[] = [];
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const subtaskRows = subtasks.map((subtask: any) => ({
        title: subtask.title,
        description: subtask.description ?? null,
        deadline: subtask.deadline ?? null,
        priority: subtask.priority ?? "medium",
        status: subtask.status ?? "todo",
        team_id: id,
        created_by: user.id,
        parent_task_id: inserted.id,
      }));

      const { data: insertedSubtasks, error: subtaskError } = await supabase
        .from("tasks")
        .insert(subtaskRows)
        .select("id,title,description,deadline,priority,status");

      if (subtaskError || !insertedSubtasks) {
        return NextResponse.json({ message: "Unable to create subtasks", error: String(subtaskError) }, { status: 500 });
      }

      const assigneeRows = subtasks.flatMap((subtask: any, index: number) => {
        const taskId = insertedSubtasks[index]?.id;
        if (!taskId || !Array.isArray(subtask.assigneeIds)) return [];
        return subtask.assigneeIds.map((userId: string) => ({ task_id: taskId, user_id: userId }));
      });

      if (assigneeRows.length > 0) {
        const { error: assignError } = await supabase.from("task_assignees").insert(assigneeRows);
        if (assignError) {
          return NextResponse.json({ message: "Unable to assign subtask users", error: assignError.message }, { status: 500 });
        }
      }

      const assigneeIdGroups = subtasks.map((subtask: any) => Array.isArray(subtask.assigneeIds) ? subtask.assigneeIds : []);
      const profileIds = Array.from(new Set(assigneeIdGroups.flat()));
      const profileMap: Record<string, TaskAssigneeProfile> = {};

      if (profileIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id,email,avatar_url")
          .in("id", profileIds);

        if (!profileError && profiles) {
          profiles.forEach((profile: { id: string; email?: string | null; avatar_url?: string | null }) => {
            const initials = profile.email
              ? profile.email
                  .split("@")[0]
                  .split(/\W+/)
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : undefined;
            profileMap[profile.id] = {
              id: profile.id,
              avatarUrl: profile.avatar_url ?? undefined,
              initials,
              email: profile.email ?? undefined,
            };
          });
        }
      }

      createdSubtasks.push(
        ...insertedSubtasks.map((subtask: any, index: number) => ({
          id: subtask.id,
          title: subtask.title,
          description: subtask.description ?? "",
          deadline: subtask.deadline ?? null,
          priority: subtask.priority ?? "medium",
          status: subtask.status ?? "todo",
          assignees: (assigneeIdGroups[index] ?? []).map((userId: string) => profileMap[userId]).filter(Boolean) as TaskAssigneeProfile[],
        })),
      );
    }

    return NextResponse.json({
      task: {
        ...inserted,
        description: inserted.description ?? "",
        deadline: inserted.deadline ?? null,
        priority: inserted.priority ?? "medium",
        status: inserted.status ?? "todo",
        assignees,
        subtasks: createdSubtasks,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Unable to create task", error: String(error) }, { status: 500 });
  }
}
