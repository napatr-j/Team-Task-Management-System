import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const roleIdMap = {
  Manager: 2,
  Member: 3,
} as const;

const inviteSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  role: z.enum(["Manager", "Member"]).default("Member"),
});

function buildInitials(fullName: string | null | undefined, email: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(" ");
    return parts.map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const body = await request.json();
    const parseResult = inviteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid email", errors: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { email, role } = parseResult.data;
    const { data: targetUser, error: userLookupError } = await supabase
      .from("auth.users")
      .select("id,email")
      .ilike("email", email)
      .single();

    if (userLookupError || !targetUser) {
      return NextResponse.json(
        { message: "Unable to locate a member with that email" },
        { status: 404 },
      );
    }

    const { data: existingMembership } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", id)
      .eq("user_id", targetUser.id)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { message: "That member is already part of the group" },
        { status: 400 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,avatar_url")
      .eq("id", targetUser.id)
      .maybeSingle();

    if (!profile) {
      const { error: profileInsertError } = await supabase.from("profiles").insert({ id: targetUser.id });
      if (profileInsertError) {
        return NextResponse.json(
          { message: "Unable to prepare member profile" },
          { status: 500 },
        );
      }
    }

    const { error: inviteError } = await supabase.from("team_members").insert({
      team_id: id,
      user_id: targetUser.id,
    });

    if (inviteError) {
      return NextResponse.json(
        { message: "Unable to invite member", error: inviteError.message },
        { status: 500 },
      );
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: targetUser.id,
      team_id: id,
      role_id: roleIdMap[role],
    });

    if (roleError) {
      return NextResponse.json(
        { message: "Unable to assign member role", error: roleError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        id: targetUser.id,
        email: targetUser.email,
        fullName: profile?.full_name ?? null,
        role,
        avatarInitials: buildInitials(profile?.full_name, targetUser.email),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Unexpected invite error", error: String(error) },
      { status: 500 },
    );
  }
}
