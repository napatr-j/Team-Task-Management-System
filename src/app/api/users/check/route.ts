import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = emailSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid email", errors: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const emailLower = parseResult.data.email.toLowerCase();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, avatar_url")
      .eq("email", emailLower)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: "Database error", error: error.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: profile.id,
        email: profile.email,
        avatarUrl: profile.avatar_url ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Unexpected error", error: String(error) },
      { status: 500 }
    );
  }
}