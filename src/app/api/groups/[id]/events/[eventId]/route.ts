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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,team_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event || event.team_id !== id) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const updates: Record<string, any> = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.description === "string") updates.description = data.description;
  if (typeof data.start_time === "string") updates.start_time = data.start_time;
  if (typeof data.end_time === "string") updates.end_time = data.end_time;

  const { data: updatedEvent, error: updateError } = await supabase
    .from("events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();

  if (updateError || !updatedEvent) {
    return NextResponse.json({ message: "Unable to update event", error: updateError?.message }, { status: 500 });
  }

  if (Array.isArray(data.participantIds)) {
    await supabase.from("event_participants").delete().eq("event_id", eventId);
    const participantRows = data.participantIds.map((userId: string) => ({ event_id: eventId, user_id: userId }));
    if (participantRows.length > 0) {
      const { error: participantError } = await supabase.from("event_participants").insert(participantRows);
      if (participantError) {
        return NextResponse.json({ message: "Unable to update participants", error: participantError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ...updatedEvent, participants: data.participantIds ?? [] });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,team_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event || event.team_id !== id) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  await supabase.from("event_participants").delete().eq("event_id", eventId);
  const { error: deleteError } = await supabase.from("events").delete().eq("id", eventId);

  if (deleteError) {
    return NextResponse.json({ message: "Unable to delete event", error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
