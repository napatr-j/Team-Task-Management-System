import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const teamIds = await getTeamIds(supabase, user.id);
  let query = supabase.from("tasks").select("id,priority,status,deadline").neq("status", "done");

  if (teamIds.length) {
    query = query.in("team_id", teamIds);
  }

  type FocusAreaTask = {
    deadline: string | null;
    priority: string | null;
    status: string | null;
  };

  const { data, error } = await query;
  const tasks = (data || []) as FocusAreaTask[];

  if (error || !data) {
    return NextResponse.json({ message: "Failed to load focus areas" }, { status: 500 });
  }

  const now = new Date();
  const overdueCount = tasks.filter((task) => task.deadline && new Date(task.deadline) < now).length;
  const highPriorityCount = tasks.filter((task) => task.priority === "high").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;

  return NextResponse.json([
    { id: "focus-priority", label: "High priority", color: "olive", taskCount: highPriorityCount },
    { id: "focus-progress", label: "In progress", color: "oliveDark", taskCount: inProgressCount },
    { id: "focus-overdue", label: "Overdue", color: "contrast", taskCount: overdueCount },
  ]);
}
