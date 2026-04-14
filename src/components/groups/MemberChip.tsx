import { X } from "lucide-react";

export interface MemberChipProps {
  email: string;
  initials: string;
  role?: string;
  onRemove: () => void;
}

export function MemberChip({ email, initials, role, onRemove }: MemberChipProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[#E0E0E0] bg-surface px-3 py-2 text-sm text-textMuted">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive/10 text-olive font-semibold">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-text">{email}</p>
        {role ? (
          <p className="text-[11px] uppercase tracking-[0.15em] text-textMuted">
            {role}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-textMuted transition hover:bg-red-50 hover:text-red-500"
        aria-label={`Remove ${email}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
