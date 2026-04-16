import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function authorizeUserForTask(supabase: Awaited<ReturnType<typeof createClient>>, taskId: string, userId: string) {
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("team_id")
    .eq("id", taskId)
    .single();

  if (taskError || !task) return false;

  const { data: membership, error: membershipError } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", task.team_id)
    .eq("user_id", userId)
    .single();

  return Boolean(!membershipError && membership);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAuthorized = await authorizeUserForTask(supabase, id, user.id);
  if (!isAuthorized) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { data: task, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error || !task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAuthorized = await authorizeUserForTask(supabase, id, user.id);
  if (!isAuthorized) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.status !== undefined) updates.status = body.status;

  const { data: updatedTask, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .single();

  if (error || !updatedTask) {
    return NextResponse.json({ message: "Unable to update task" }, { status: 500 });
  }

  return NextResponse.json(updatedTask);
}
