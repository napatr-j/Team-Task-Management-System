import { Group } from "@/types/group";
import { GroupCard } from "@/components/groups/GroupCard";

export interface GroupGridProps {
  groups: Group[];
  onSelect: (groupId: string) => void;
}

export function GroupGrid({ groups, onSelect }: GroupGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} onSelect={onSelect} />
      ))}
    </div>
  );
}
