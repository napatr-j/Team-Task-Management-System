import { ChevronRight } from "lucide-react";
import { Group } from "@/types/group";
import { cn } from "@/lib/utils";

export interface GroupCardProps {
  group: Group;
  onSelect: (groupId: string) => void;
}

export function GroupCard({ group, onSelect }: GroupCardProps) {
  const initials = group.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[12px] border border-[#E0E0E0] bg-surface p-5 transition duration-200",
        "hover:-translate-y-1 hover:shadow-md",
      )}
      aria-label={`Open group ${group.name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-olive/10 text-olive text-lg font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-base font-semibold text-text">{group.name}</p>
            <p className="text-xs text-textMuted">{group.memberCount} members</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(group.id)}
          className="invisible rounded-full border border-transparent p-2 text-olive transition duration-200 group-hover:visible group-hover:bg-olive group-hover:text-white group-hover:shadow-sm hover:scale-[0.98]"
          aria-label={`View ${group.name}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-textMuted">
        {group.mission}
      </p>

      <div className="mt-5 flex items-center gap-3">
        {group.members.slice(0, 3).map((member) => (
          <span
            key={member.id}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-olive/10 text-xs font-semibold text-olive"
            title={member.email}
          >
            {member.avatarInitials}
          </span>
        ))}
        {group.memberCount > 3 ? (
          <span className="flex h-9 min-w-[36px] items-center justify-center rounded-full bg-surface text-xs font-semibold text-textMuted border border-[#E0E0E0]">
            +{group.memberCount - 3}
          </span>
        ) : null}
      </div>
    </article>
  );
}
