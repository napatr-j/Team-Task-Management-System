import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function authorizeUserForTask(supabase: Awaited<ReturnType<typeof createClient>>, teamId: string, userId: string) {
  const { data: membership, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();

  return Boolean(!error && membership);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  try {
    const body = await request.json();
    const { title, description, deadline, priority, status, assigneeIds } = body;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: existingTask, error: taskError } = await supabase
      .from("tasks")
      .select("team_id")
      .eq("id", taskId)
      .single();

    if (taskError || !existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const authorized = await authorizeUserForTask(supabase, existingTask.team_id, user.id);
    if (!authorized) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (deadline !== undefined) updates.deadline = deadline;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .single();

    if (updateError || !updatedTask) {
      return NextResponse.json({ message: "Unable to update task" }, { status: 500 });
    }

    if (Array.isArray(assigneeIds)) {
      await supabase.from("task_assignees").delete().eq("task_id", taskId);
      if (assigneeIds.length > 0) {
        const { error: assignError } = await supabase.from("task_assignees").insert(
          assigneeIds.map((userId: string) => ({ task_id: taskId, user_id: userId })),
        );

        if (assignError) {
          return NextResponse.json({ message: "Unable to update assignees", error: assignError.message }, { status: 500 });
        }
      }
    }

    if (Array.isArray(body.subtasks)) {
      const { data: existingSubtasks, error: existingSubtaskError } = await supabase
        .from("subtasks")
        .select("id")
        .eq("task_id", taskId);

      if (existingSubtaskError) {
        return NextResponse.json({ message: "Unable to update subtasks", error: existingSubtaskError.message }, { status: 500 });
      }

      const existingSubtaskIds = (existingSubtasks ?? []).map((subtask) => subtask.id);
      if (existingSubtaskIds.length > 0) {
        const { error: deleteSubtaskAssigneesError } = await supabase
          .from("subtask_assignees")
          .delete()
          .in("subtask_id", existingSubtaskIds);
        if (deleteSubtaskAssigneesError) {
          return NextResponse.json({ message: "Unable to update subtask assignments", error: deleteSubtaskAssigneesError.message }, { status: 500 });
        }

        const { error: deleteSubtasksError } = await supabase
          .from("subtasks")
          .delete()
          .eq("task_id", taskId);
        if (deleteSubtasksError) {
          return NextResponse.json({ message: "Unable to remove previous subtasks", error: deleteSubtasksError.message }, { status: 500 });
        }
      }

      if (body.subtasks.length > 0) {
        const subtaskRows = body.subtasks.map((subtask: any) => ({
          task_id: taskId,
          title: subtask.title,
          status: subtask.status ?? "todo",
        }));

        const { data: insertedSubtasks, error: subtaskInsertError } = await supabase
          .from("subtasks")
          .insert(subtaskRows)
          .select();

        if (subtaskInsertError || !insertedSubtasks) {
          return NextResponse.json({ message: "Unable to update subtasks", error: String(subtaskInsertError) }, { status: 500 });
        }

        for (let index = 0; index < insertedSubtasks.length; index += 1) {
          const created = insertedSubtasks[index];
          const payload = body.subtasks[index];
          const assigneeIdsForSubtask = Array.isArray(payload.assigneeIds) ? payload.assigneeIds : [];

          if (assigneeIdsForSubtask.length > 0) {
            const { error: subtaskAssignError } = await supabase.from("subtask_assignees").insert(
              assigneeIdsForSubtask.map((userId: string) => ({ subtask_id: created.id, user_id: userId })),
            );
            if (subtaskAssignError) {
              return NextResponse.json({ message: "Unable to update subtask assignees", error: subtaskAssignError.message }, { status: 500 });
            }
          }
        }
      }
    }

    return NextResponse.json({ task: { ...updatedTask, description: updatedTask.description ?? "", deadline: updatedTask.deadline ?? null, priority: updatedTask.priority ?? "medium", status: updatedTask.status ?? "todo" } });
  } catch (error) {
    return NextResponse.json({ message: "Unable to update task", error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: existingTask, error: taskError } = await supabase
      .from("tasks")
      .select("team_id")
      .eq("id", taskId)
      .single();

    if (taskError || !existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const authorized = await authorizeUserForTask(supabase, existingTask.team_id, user.id);
    if (!authorized) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data: deletedTask, error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .single();

    if (deleteError || !deletedTask) {
      return NextResponse.json({ message: "Unable to delete task" }, { status: 500 });
    }

    return NextResponse.json({ task: deletedTask });
  } catch (error) {
    return NextResponse.json({ message: "Unable to delete task", error: String(error) }, { status: 500 });
  }
}
