"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface InvitedMember {
  id: string;
  email: string;
  fullName?: string;
  role: "Manager" | "Member";
  avatarInitials: string;
}

export interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAddInvite: (member: InvitedMember) => void;
  existingEmails: string[];
}

export function InviteMemberDialog({
  open,
  onClose,
  onAddInvite,
  existingEmails,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<InvitedMember | null>(null);
  const [role, setRole] = useState<"Manager" | "Member">("Member");

  const resetDialog = () => {
    setEmail("");
    setError(null);
    setFoundUser(null);
    setRole("Member");
    setLoading(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleCheckEmail = async () => {
    setError(null);
    setFoundUser(null);
    if (!email.trim()) {
      setError("Please enter an email address to validate.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message || "Could not find a user with that email.");
        return;
      }

      const result = await response.json();
      if (existingEmails.includes(result.email)) {
        setError("This user is already invited.");
        return;
      }

      setFoundUser({
        id: result.id,
        email: result.email,
        fullName: result.fullName ?? undefined,
        role: "Member",
        avatarInitials: result.fullName
          ? result.fullName
              .split(" ")
              .map((part: string) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : result.email.slice(0, 2).toUpperCase(),
      });
    } catch (err) {
      setError("Unable to validate this email right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!foundUser) {
      setError("Please validate a user before adding.");
      return;
    }

    onAddInvite({ ...foundUser, role });
    resetDialog();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-olive">Invite member</p>
            <h2 className="mt-2 text-xl font-semibold text-text">Add a teammate by email</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-textMuted transition hover:text-text"
            aria-label="Close invite dialog"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textMuted" htmlFor="invite-email">
              Email address
            </label>
            <div className="flex gap-3">
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@domain.com"
                className="flex-1"
              />
              <Button
                type="button"
                className="whitespace-nowrap bg-olive text-white hover:bg-oliveDark"
                onClick={handleCheckEmail}
                disabled={loading}
              >
                {loading ? "Checking…" : "Check"}
              </Button>
            </div>
          </div>

          {foundUser ? (
            <div className="rounded-3xl border border-[#E0E0E0] bg-[#F9FAFB] p-4">
              <p className="text-sm font-semibold text-text">User found</p>
              <p className="text-sm text-textMuted">
                {foundUser.fullName || foundUser.email}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <label className="text-sm font-medium text-textMuted">Role</label>
                <div className="flex flex-wrap gap-3">
                  {(["Member", "Manager"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        role === option
                          ? "border-olive bg-olive/10 text-olive"
                          : "border-[#E0E0E0] text-text"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-[#E0E0E0] text-text hover:bg-[#F5F5F5]"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-olive text-white hover:bg-oliveDark"
              onClick={handleAdd}
              disabled={!foundUser}
            >
              Add member
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
