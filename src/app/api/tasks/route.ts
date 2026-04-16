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

  const grouped: Record<string, any[]> = {};

  (tasks || []).forEach((t) => {
    if (!t.deadline) return;

    const date = t.deadline.slice(0, 10);

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(t);
  });

  return NextResponse.json(grouped);
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
  }

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert([data])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(inserted);
}
