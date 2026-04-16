import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type TaskAssigneeProfile = { id: string; avatarUrl?: string; initials?: string };
type TaskAssigneeMap = Record<string, TaskAssigneeProfile[]>;
type SubtaskWithAssignees = {
  id: string;
  title: string;
  status: string;
  assignees: TaskAssigneeProfile[];
};
type SubtaskMap = Record<string, SubtaskWithAssignees[]>;
type CreatedSubtask = {
  id: string;
  title: string;
  status: string;
  assignees: TaskAssigneeProfile[];
};

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
    .select("id,full_name,avatar_url")
    .in("id", userIds);

  if (profileError || !profiles) return {};

  const profileMap = profiles.reduce((acc: Record<string, TaskAssigneeProfile>, profile: { id: string; full_name?: string | null; avatar_url?: string | null }) => {
    const initials = profile.full_name
      ? profile.full_name
          .split(" ")
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : undefined;

    acc[profile.id] = {
      id: profile.id,
      avatarUrl: profile.avatar_url ?? undefined,
      initials,
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

async function getSubtasksWithAssignees(supabase: any, taskIds: string[]): Promise<SubtaskMap> {
  if (taskIds.length === 0) return {};

  const { data: subtasks, error: subtaskError } = await supabase
    .from("subtasks")
    .select("id,task_id,title,status")
    .in("task_id", taskIds);

  if (subtaskError || !subtasks) return {};

  const subtaskIds = subtasks.map((subtask: { id: string }) => subtask.id);
  const emptyMap: SubtaskMap = {};

  if (subtaskIds.length === 0) {
    return subtasks.reduce((acc: SubtaskMap, subtask: { task_id: string; id: string; title: string; status: string }) => {
      acc[subtask.task_id] = acc[subtask.task_id] ?? [];
      acc[subtask.task_id].push({ ...subtask, assignees: [] });
      return acc;
    }, emptyMap);
  }

  const { data: assignmentRows, error: assignmentError } = await supabase
    .from("subtask_assignees")
    .select("subtask_id,user_id")
    .in("subtask_id", subtaskIds);

  if (assignmentError || !assignmentRows) {
    return subtasks.reduce((acc: SubtaskMap, subtask: { task_id: string; id: string; title: string; status: string }) => {
      acc[subtask.task_id] = acc[subtask.task_id] ?? [];
      acc[subtask.task_id].push({ ...subtask, assignees: [] });
      return acc;
    }, emptyMap);
  }

  const userIds = Array.from(new Set(assignmentRows.map((row: { user_id: string }) => row.user_id)));
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,avatar_url")
    .in("id", userIds);

  if (profileError || !profiles) {
    return subtasks.reduce((acc: SubtaskMap, subtask: { task_id: string; id: string; title: string; status: string }) => {
      acc[subtask.task_id] = acc[subtask.task_id] ?? [];
      acc[subtask.task_id].push({ ...subtask, assignees: [] });
      return acc;
    }, emptyMap);
  }

  const profileMap = profiles.reduce((acc: Record<string, TaskAssigneeProfile>, profile: { id: string; full_name?: string | null; avatar_url?: string | null }) => {
    const initials = profile.full_name
      ? profile.full_name
          .split(" ")
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : undefined;

    acc[profile.id] = {
      id: profile.id,
      avatarUrl: profile.avatar_url ?? undefined,
      initials,
    };
    return acc;
  }, {});

  const assigneeMap: Record<string, TaskAssigneeProfile[]> = assignmentRows.reduce((acc: Record<string, TaskAssigneeProfile[]>, row: { subtask_id: string; user_id: string }) => {
    const profile = profileMap[row.user_id];
    if (!profile) return acc;
    if (!acc[row.subtask_id]) acc[row.subtask_id] = [];
    acc[row.subtask_id].push(profile);
    return acc;
  }, {} as Record<string, TaskAssigneeProfile[]>);

  return subtasks.reduce((acc: SubtaskMap, subtask: { task_id: string; id: string; title: string; status: string }) => {
    acc[subtask.task_id] = acc[subtask.task_id] ?? [];
    acc[subtask.task_id].push({
      ...subtask,
      assignees: assigneeMap[subtask.id] ?? [],
    });
    return acc;
  }, emptyMap);
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
      .select("id,title,description,deadline,priority,status,created_by")
      .eq("team_id", id)
      .order("deadline", { ascending: true });

    if (error) {
      return NextResponse.json({ message: "Unable to load tasks" }, { status: 500 });
    }

    const taskRows = tasks ?? [];
    const taskIds = taskRows.map((task) => task.id);
    const assigneeMap = await getTaskAssignees(supabase, taskIds);
    const subtaskMap = await getSubtasksWithAssignees(supabase, taskIds);

    return NextResponse.json({
      tasks: taskRows.map((task) => ({
        ...task,
        description: task.description ?? "",
        deadline: task.deadline ?? null,
        priority: task.priority ?? "medium",
        status: task.status ?? "todo",
        assignees: assigneeMap[task.id] ?? [],
        subtasks: subtaskMap[task.id] ?? [],
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
        },
      ])
      .select()
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ message: "Unable to create task" }, { status: 500 });
    }

    const assignees: Array<{ id: string; avatarUrl?: string; initials?: string }> = [];
    if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      const { error: assignError } = await supabase.from("task_assignees").insert(
        assigneeIds.map((userId: string) => ({ task_id: inserted.id, user_id: userId })),
      );

      if (assignError) {
        return NextResponse.json({ message: "Unable to assign task users", error: assignError.message }, { status: 500 });
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", assigneeIds);

      if (!profileError && profiles) {
        profiles.forEach((profile: { id: string; full_name?: string | null; avatar_url?: string | null }) => {
          const initials = profile.full_name
            ? profile.full_name
                .split(" ")
                .map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : undefined;
          assignees.push({ id: profile.id, avatarUrl: profile.avatar_url ?? undefined, initials });
        });
      }
    }

    const createdSubtasks: CreatedSubtask[] = [];
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const subtaskRows = subtasks.map((subtask: any) => ({
        task_id: inserted.id,
        title: subtask.title,
        status: subtask.status ?? "todo",
      }));

      const { data: insertedSubtasks, error: subtaskError } = await supabase
        .from("subtasks")
        .insert(subtaskRows)
        .select();

      if (subtaskError || !insertedSubtasks) {
        return NextResponse.json({ message: "Unable to create subtasks", error: String(subtaskError) }, { status: 500 });
      }

      for (let index = 0; index < insertedSubtasks.length; index += 1) {
        const created = insertedSubtasks[index];
        const payload = subtasks[index];
        const assigneeIdsForSubtask = Array.isArray(payload.assigneeIds) ? payload.assigneeIds : [];
        const assigneesForSubtask: Array<{ id: string; avatarUrl?: string; initials?: string }> = [];

        if (assigneeIdsForSubtask.length > 0) {
          const { error: subtaskAssignError } = await supabase.from("subtask_assignees").insert(
            assigneeIdsForSubtask.map((userId: string) => ({ subtask_id: created.id, user_id: userId })),
          );

          if (subtaskAssignError) {
            return NextResponse.json({ message: "Unable to assign subtask users", error: subtaskAssignError.message }, { status: 500 });
          }

          const { data: profiles, error: subtaskProfileError } = await supabase
            .from("profiles")
            .select("id,full_name,avatar_url")
            .in("id", assigneeIdsForSubtask);

          if (!subtaskProfileError && profiles) {
            profiles.forEach((profile: { id: string; full_name?: string | null; avatar_url?: string | null }) => {
              const initials = profile.full_name
                ? profile.full_name
                    .split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : undefined;
              assigneesForSubtask.push({ id: profile.id, avatarUrl: profile.avatar_url ?? undefined, initials });
            });
          }
        }

        createdSubtasks.push({
          id: created.id,
          title: created.title,
          status: created.status,
          assignees: assigneesForSubtask,
        });
      }
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
