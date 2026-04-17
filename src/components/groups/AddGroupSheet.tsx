"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteMemberDialog, type InvitedMember } from "@/components/groups/InviteMemberDialog";
import { MemberChip } from "@/components/groups/MemberChip";
import { Group } from "@/types/group";

const groupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export interface AddGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (group: Group) => void;
}

export function AddGroupSheet({ open, onOpenChange, onGroupCreated }: AddGroupSheetProps) {
  const [members, setMembers] = useState<InvitedMember[]>([]);
  const [openInvite, setOpenInvite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const canSubmit = form.formState.isValid && !isSubmitting;

  const memberChips = useMemo(
    () =>
      members.map((member) => ({
        email: member.email,
        initials: member.avatarInitials,
        role: member.role,
      })),
    [members],
  );

  const handleAddInvite = (member: InvitedMember) => {
    setMembers((current) => [...current, member]);
  };

  const handleRemoveMember = (email: string) => {
    setMembers((current) => current.filter((item) => item.email !== email));
  };

  const handleClose = () => {
    form.reset();
    form.clearErrors();
    setMembers([]);
    setServerError(null);
    setOpenInvite(false);
    onOpenChange(false);
  };

  const handleInvalidSubmit = () => {
    setServerError(null);
  };

  const onSubmit = async (values: GroupFormValues) => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, members }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to create group");
      }

      onGroupCreated(data as Group);
      handleClose();
    } catch (error) {
      console.error(error);
      setServerError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-stretch bg-black/30" aria-hidden={!open}>
      <button
        type="button"
        className="flex-1"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
        }}
        tabIndex={open ? 0 : -1}
        aria-label="Close sheet"
      />
      <div
        className={
          "relative flex h-full w-full max-w-xl flex-col bg-bg p-6 shadow-soft transition-transform duration-300" +
          (open ? " translate-x-0" : " translate-x-full")
        }
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleClose();
            }}
            className="text-3xl leading-none text-textMuted transition hover:text-text"
            aria-label="Close new group sheet"
          >
            ×
          </button>
          <p className="text-xs uppercase tracking-[0.32em] text-olive">NEW COLLECTIVE</p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-semibold text-text">Group Assembly</h2>
            <p className="mt-2 text-sm leading-6 text-textMuted">
              Define the purpose and curate the members for your next challenge.
            </p>
          </div>

          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-textMuted">
                Group Name
              </label>
              <Input
                id="name"
                placeholder="e.g. Neo-Brutalist Revitalization"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-3 rounded-3xl border border-[#E0E0E0] bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Invite Members via Email</p>
                  <p className="text-sm text-textMuted">Validate existing users before inviting them.</p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="bg-olive text-white hover:bg-oliveDark"
                  onClick={() => setOpenInvite(true)}
                >
                  Invite
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {memberChips.map((member) => (
                  <MemberChip
                    key={member.email}
                    email={member.email}
                    initials={member.initials}
                    role={member.role}
                    onRemove={() => handleRemoveMember(member.email)}
                  />
                ))}
              </div>
            </div>

            {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-[#E0E0E0] text-text hover:bg-[#F5F5F5]"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleClose();
                }}
              >
                Discard
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-olive text-white hover:bg-oliveDark disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSubmit}
              >
                Initiate Collective
              </Button>
            </div>
          </form>
        </div>

        <InviteMemberDialog
          open={openInvite}
          onClose={() => setOpenInvite(false)}
          onAddInvite={handleAddInvite}
          existingEmails={members.map((member) => member.email)}
        />
      </div>
    </div>
  );
}
