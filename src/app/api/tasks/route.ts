import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function authorizeTeamMembership(supabase: Awaited<ReturnType<typeof createClient>>, teamId: string, userId: string) {
  const { data: membership, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();

  return Boolean(!error && membership);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get("team_id");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const parent = searchParams.get("parent");

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (team_id) {
    const authorized = await authorizeTeamMembership(supabase, team_id, user.id);
    if (!authorized) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  let query = supabase.from("tasks").select("*");

  if (team_id) query = query.eq("team_id", team_id);

  if (month && year) {
    const start = `${year}-${month.padStart(2, "0")}-01`;
    const end = new Date(Number(year), Number(month), 0)
      .toISOString()
      .slice(0, 10);

    query = query.gte("deadline", start).lte("deadline", end);
  }

  if (parent === "true") {
    query = query.is("parent_task_id", null);
  }

  const { data: tasks, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const grouped: Record<string, unknown[]> = {};

  (tasks || []).forEach((t) => {
    if (!t.deadline) return;

    const date = t.deadline.slice(0, 10);

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(t);
  });

  return NextResponse.json(grouped);
}

function normalizeStatus(status?: string) {
  if (status === "inprogress") return "in_progress";
  if (status === "in_progress" || status === "todo" || status === "done") return status;
  return "todo";
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const team_id = data.team_id as string | undefined;
  if (team_id) {
    const authorized = await authorizeTeamMembership(supabase, team_id, user.id);
    if (!authorized) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", team_id)
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleRow || ![1, 2].includes(roleRow.role_id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  const title = data.title as string | undefined;
  if (!title) {
    return NextResponse.json({ message: "Task title is required" }, { status: 400 });
  }

  const assigneeEmails = Array.isArray(data.assigned_to)
    ? data.assigned_to.filter(Boolean)
    : data.assigned_to
    ? [data.assigned_to]
    : [];

  const taskPayload = {
    title,
    description: data.description ?? null,
    deadline: data.deadline || null,
    priority: data.priority ?? "medium",
    status: normalizeStatus(data.status),
    team_id: team_id ?? null,
    created_by: user.id,
    parent_task_id: data.parent_task_id ?? null,
  };

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert([taskPayload])
    .select()
    .single();

  if (error || !inserted) {
    return NextResponse.json({ error: error?.message || "Unable to create task" }, { status: 500 });
  }

  if (assigneeEmails.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id,email")
      .in("email", assigneeEmails);

    if (!profileError && profiles) {
      const assigneeRows = profiles.map((profile: { id: string }) => ({
        task_id: inserted.id,
        user_id: profile.id,
      }));

      if (assigneeRows.length > 0) {
        const { error: assignError } = await supabase.from("task_assignees").insert(assigneeRows);
        if (assignError) {
          return NextResponse.json({ error: assignError.message }, { status: 500 });
        }
      }
    }
  }

  if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
    const subtasks = data.subtasks as Array<{
      title: string;
      description?: string;
      deadline?: string | null;
      priority?: string;
      status?: string;
      assigneeIds?: string[];
    }>;

    const childTaskRows = subtasks.map((subtask) => ({
      title: subtask.title,
      description: subtask.description ?? null,
      deadline: subtask.deadline || null,
      priority: subtask.priority ?? "medium",
      status: normalizeStatus(subtask.status),
      team_id: team_id ?? null,
      created_by: user.id,
      parent_task_id: inserted.id,
    }));

    const { data: insertedChildTasks, error: childTasksError } = await supabase
      .from("tasks")
      .insert(childTaskRows)
      .select("id");

    if (childTasksError || !insertedChildTasks) {
      return NextResponse.json({ error: childTasksError?.message || "Unable to create subtasks" }, { status: 500 });
    }

    const subtaskAssignees = subtasks.flatMap((subtask, index) => {
      const childTaskId = insertedChildTasks[index]?.id;
      if (!childTaskId || !Array.isArray(subtask.assigneeIds)) return [];
      return subtask.assigneeIds.map((userId) => ({ task_id: childTaskId, user_id: userId }));
    });

    if (subtaskAssignees.length > 0) {
      const { error: assignError } = await supabase.from("task_assignees").insert(subtaskAssignees);
      if (assignError) {
        return NextResponse.json({ error: assignError.message }, { status: 500 });
      }
    }
  }

  const responseTask = {
    ...inserted,
    assigned_to: assigneeEmails.length > 0 ? assigneeEmails : undefined,
  };

  return NextResponse.json(responseTask);
}
