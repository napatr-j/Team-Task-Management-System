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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const authorized = await authorizeTeamMembership(supabase, id, user.id);
  if (!authorized) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let query = supabase.from("events").select("id,title,description,start_time,end_time,created_by,team_id").eq("team_id", id);

  if (month && year) {
    const start = `${year}-${month.padStart(2, "0")}-01`;
    const end = new Date(Number(year), Number(month), 0).toISOString().slice(0, 10);
    query = query.gte("start_time", start).lte("start_time", end);
  }

  const { data: events, error } = await query;
  if (error) {
    return NextResponse.json({ message: "Unable to load events", error: error.message }, { status: 500 });
  }

  const eventRows = events ?? [];
  const eventIds = eventRows.map((event: any) => event.id);
  const { data: participants, error: participantsError } = await supabase
    .from("event_participants")
    .select("event_id,user_id")
    .in("event_id", eventIds);

  const participantMap: Record<string, string[]> = {};
  (participants ?? []).forEach((row: any) => {
    if (!participantMap[row.event_id]) participantMap[row.event_id] = [];
    participantMap[row.event_id].push(row.user_id);
  });

  const grouped: Record<string, any[]> = {};
  eventRows.forEach((event: any) => {
    const dateKey = event.start_time.slice(0, 10);
    const eventWithParticipants = {
      ...event,
      participants: participantMap[event.id] ?? [],
    };
    grouped[dateKey] = grouped[dateKey] ?? [];
    grouped[dateKey].push(eventWithParticipants);
  });

  return NextResponse.json(grouped);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const authorized = await authorizeTeamMembership(supabase, id, user.id);
  if (!authorized) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const title = data.title as string | undefined;
  const start_time = data.start_time as string | undefined;
  const end_time = data.end_time as string | undefined;

  if (!title || !start_time || !end_time) {
    return NextResponse.json({ message: "Title, start time, and end time are required" }, { status: 400 });
  }

  const { data: inserted, error } = await supabase
    .from("events")
    .insert([{ title, description: data.description ?? null, start_time, end_time, team_id: id, created_by: user.id }])
    .select()
    .single();

  if (error || !inserted) {
    return NextResponse.json({ message: "Unable to create event", error: error?.message }, { status: 500 });
  }

  const participantIds = Array.isArray(data.participantIds) ? data.participantIds : [];
  if (participantIds.length > 0) {
    const rows = participantIds.map((userId: string) => ({ event_id: inserted.id, user_id: userId }));
    const { error: participantError } = await supabase.from("event_participants").insert(rows);
    if (participantError) {
      return NextResponse.json({ message: "Unable to save event participants", error: participantError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ...inserted, participants: participantIds });
}
