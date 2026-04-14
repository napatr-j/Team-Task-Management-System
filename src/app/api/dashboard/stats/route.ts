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

type StatQuery = {
  gte: (column: string, value: string) => StatQuery;
  lt: (column: string, value: string) => StatQuery;
  neq: (column: string, value: string) => StatQuery;
  eq: (column: string, value: string) => StatQuery;
  in: (column: string, values: string[]) => StatQuery;
};

async function countTasks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queryBuilder: (query: StatQuery) => StatQuery,
) {
  const query = queryBuilder(
    supabase.from("tasks").select("id", { count: "exact", head: true }) as unknown as StatQuery,
  );
  const result = await query;
  const { count, error } = (result as unknown) as { count: number | null; error: unknown };

  if (error) {
    throw error;
  }

  return count ?? 0;
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

  if (!validGroupId && teamIds.length === 0) {
    return NextResponse.json({ overdue: 0, priority: 0, inProgress: 0, velocity: 0 });
  }

  const teamFilter = (query: StatQuery) =>
    validGroupId ? query.eq("team_id", validGroupId) : query.in("team_id", teamIds);

  const now = new Date();
  const nowIso = now.toISOString();
  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayIso = nextDay.toISOString();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString();

  try {
    const overdue = await countTasks(
      supabase,
      (query) => teamFilter(query).lt("deadline", nowIso).neq("status", "done"),
    );
    const priority = await countTasks(
      supabase,
      (query) => teamFilter(query).gte("deadline", nowIso).lt("deadline", nextDayIso).neq("status", "done"),
    );
    const inProgress = await countTasks(
      supabase,
      (query) => teamFilter(query).gte("deadline", nowIso).neq("status", "done"),
    );
    const completedCount = await countTasks(
      supabase,
      (query) => teamFilter(query).gte("updated_at", weekAgoIso).eq("status", "done"),
    );
    const recentCount = await countTasks(
      supabase,
      (query) => teamFilter(query).gte("updated_at", weekAgoIso),
    );

    const velocity = recentCount > 0 ? Math.round((completedCount / recentCount) * 100) : 0;

    return NextResponse.json({ overdue, priority, inProgress, velocity });
  } catch {
    return NextResponse.json({ message: "Failed to load stats" }, { status: 500 });
  }
}
