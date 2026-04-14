import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id);

  if (membershipError || !memberships) {
    return NextResponse.json([], { status: 200 });
  }

  const teamIds = memberships.map((item) => item.team_id);
  if (teamIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const { data: teams, error: teamError } = await supabase.from("teams").select("id,name").in("id", teamIds);
  if (teamError || !teams) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(teams);
}
