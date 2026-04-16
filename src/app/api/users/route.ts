import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const email = new URL(req.url).searchParams.get("email");

    const buildQuery = () => {
      let q = supabase
        .from("profiles")
        .select("id, email, avatar_url");

      if (email) {
        q = q.ilike("email", "%" + email + "%");
      }

      return q;
    };

    const { data, error } = await buildQuery();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}