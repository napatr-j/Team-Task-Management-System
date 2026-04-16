import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const roleSchema = z.object({
  role: z.enum(["Admin", "Manager", "Member"]),
});

function isAdminRole(roleId: number | null | undefined) {
  return roleId === 1;
}

function isManagerRole(roleId: number | null | undefined) {
  return roleId === 2;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const { id, memberId } = await params;
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
    const parseResult = roleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid payload", errors: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { role } = parseResult.data;

    const { data: currentRoleRow, error: currentRoleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    if (currentRoleError || !currentRoleRow) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const currentRoleId = currentRoleRow.role_id;
    if (!isAdminRole(currentRoleId) && !isManagerRole(currentRoleId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (currentRoleId === 2 && role === "Admin") {
      return NextResponse.json({ message: "Only admins can assign admin role" }, { status: 403 });
    }

    const { data: targetRoleRow, error: targetRoleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", id)
      .eq("user_id", memberId)
      .single();

    if (targetRoleError) {
      return NextResponse.json({ message: "Unable to verify member role", status: 500 });
    }

    if (!targetRoleRow) {
      return NextResponse.json({ message: "Member not found in group" }, { status: 404 });
    }

    if (isAdminRole(targetRoleRow.role_id) && !isAdminRole(currentRoleId) && user.id !== memberId) {
      return NextResponse.json({ message: "Only admins can change another admin's role" }, { status: 403 });
    }

    const roleIdMap = {
      Admin: 1,
      Manager: 2,
      Member: 3,
    } as const;

    const { error: updateError } = await supabase
      .from("user_roles")
      .update({ role_id: roleIdMap[role] })
      .eq("team_id", id)
      .eq("user_id", memberId);

    if (updateError) {
      return NextResponse.json({ message: "Unable to update role", error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Role updated", role }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Unexpected error updating role", error: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const { id, memberId } = await params;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: currentRoleRow, error: currentRoleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    if (currentRoleError || !currentRoleRow) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const currentRoleId = currentRoleRow.role_id;
    const { data: targetRoleRow } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("team_id", id)
      .eq("user_id", memberId)
      .single();

    if (targetRoleRow?.role_id === 1 && currentRoleId !== 1 && user.id !== memberId) {
      return NextResponse.json({ message: "Only admins can remove other admins" }, { status: 403 });
    }

    const canRemove =
      currentRoleId === 1 ||
      currentRoleId === 2 ||
      user.id === memberId;

    if (!canRemove) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data: deleted, error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", id)
      .eq("user_id", memberId);

    if (deleteError) {
      return NextResponse.json(
        { message: "Unable to remove member", error: deleteError.message },
        { status: 500 },
      );
    }

    const deletedData = deleted as any;
    if (!deletedData || (Array.isArray(deletedData) && deletedData.length === 0)) {
      return NextResponse.json(
        { message: "Member not found in group" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Member removed" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Unexpected error removing member", error: String(error) },
      { status: 500 },
    );
  }
}
