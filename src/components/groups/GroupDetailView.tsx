"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog, type InvitedMember } from "@/components/groups/InviteMemberDialog";
import { Group } from "@/types/group";

interface GroupDetailViewProps {
  group: Group;
}

export function GroupDetailView({ group }: GroupDetailViewProps) {
  const [members, setMembers] = useState(group.members);
  const [openInvite, setOpenInvite] = useState(false);
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isAdmin = group.currentUserRole === "Admin";
  const canManage = group.canManageMembers;
  const currentUserId = group.currentUserId;

  const handleInviteMember = async (member: InvitedMember) => {
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/groups/${group.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: member.email, role: member.role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to invite member");
      }

      setMembers((current) => [
        ...current,
        {
          id: data.id,
          email: data.email,
          fullName: data.fullName ?? undefined,
          role: data.role === "Manager" ? "Manager" : "Member",
          avatarInitials: data.avatarInitials,
        },
      ]);
      setStatusMessage("Member invited successfully.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to invite member.");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: "Admin" | "Manager" | "Member") => {
    setStatusMessage(null);
    setRoleLoadingId(memberId);

    try {
      const response = await fetch(`/api/groups/${group.id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update role");
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member,
        ),
      );
      setStatusMessage("Role updated successfully.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to update role.");
    } finally {
      setRoleLoadingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setStatusMessage(null);
    setLoadingMemberId(memberId);

    try {
      const response = await fetch(`/api/groups/${group.id}/members/${memberId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to remove member");
      }

      setMembers((current) => current.filter((member) => member.id !== memberId));
      setStatusMessage("Member removed successfully.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to remove member.");
    } finally {
      setLoadingMemberId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-[#E0E0E0] bg-surface p-8 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-olive">Group Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-text">{group.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-textMuted">{group.mission}</p>
          </div>
          <div className="grid gap-3 sm:auto-cols-min sm:grid-flow-col">
            <Button
              type="button"
              variant="ghost"
              className="text-olive hover:opacity-80"
            >
              Calendar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-olive hover:opacity-80"
            >
              Task Board
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-textMuted hover:text-olive"
            >
              Task List
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#F7F9F5] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-textMuted">Members</p>
            <p className="mt-3 text-3xl font-semibold text-text">{members.length}</p>
            <p className="mt-2 text-sm text-textMuted">Active participants in this group</p>
          </div>
          <div className="rounded-3xl bg-[#F7F9F5] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-textMuted">Current mode</p>
            <p className="mt-3 text-3xl font-semibold text-text">{group.activeProject || "Group Launch"}</p>
            <p className="mt-2 text-sm text-textMuted">A quick snapshot of what this group is working on.</p>
          </div>
        </div>
      </div>

      <section className="rounded-[32px] border border-[#E0E0E0] bg-surface p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-olive">Manage members</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Team roster</h2>
          </div>
          {group.canManageMembers ? (
            <Button
              type="button"
              className="bg-olive text-white hover:bg-oliveDark"
              onClick={() => setOpenInvite(true)}
            >
              Invite a member
            </Button>
          ) : null}
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E0E0E0] bg-white">
          <div className="grid grid-cols-[1fr_170px_120px_100px] gap-4 border-b border-[#E0E0E0] bg-[#FAFBF7] px-6 py-4 text-xs uppercase tracking-[0.24em] text-textMuted sm:grid">
            <span>Email</span>
            <span>Role</span>
            <span className="hidden sm:inline">Name</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {members.map((member) => {
              const isSelf = member.id === currentUserId;
              const canDeleteMember = isAdmin && !isSelf;
              const canChangeRole = canManage && !isSelf;
              const roleOptions = isAdmin
                ? (["Admin", "Manager", "Member"] as const)
                : (["Manager", "Member"] as const);

              return (
                <div key={member.id} className="grid grid-cols-[1fr_170px_120px_100px] gap-4 px-6 py-4 sm:grid items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-olive/10 text-olive font-semibold">
                      {member.avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text">
                        {member.email}
                        {isSelf ? (
                          <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-textMuted">You</span>
                        ) : null}
                      </p>
                      {member.fullName ? (
                        <p className="truncate text-xs text-textMuted">{member.fullName}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-sm text-text">
                    {canChangeRole ? (
                      <select
                        value={member.role}
                        onChange={(event) =>
                          handleChangeRole(
                            member.id,
                            event.target.value as "Admin" | "Manager" | "Member",
                          )
                        }
                        disabled={roleLoadingId === member.id}
                        className="w-full rounded-2xl border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-text focus:border-olive focus:ring-2 focus:ring-olive/20"
                      >
                        {roleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{member.role}</span>
                    )}
                  </div>
                  <div className="hidden text-sm text-textMuted sm:block">
                    {member.fullName ?? "—"}
                  </div>
                  <div className="flex justify-end gap-2">
                    {canDeleteMember ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#E0E0E0] text-text hover:bg-[#F5F5F5]"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loadingMemberId === member.id}
                      >
                        {loadingMemberId === member.id ? "Removing…" : "Remove"}
                      </Button>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.2em] text-textMuted">
                        {isSelf ? "You" : "—"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-3xl bg-olive/10 px-4 py-3 text-sm text-olive">
            {statusMessage}
          </div>
        ) : null}
      </section>

      <InviteMemberDialog
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        onAddInvite={handleInviteMember}
        existingEmails={members.map((member) => member.email)}
      />
    </div>
  );
}
