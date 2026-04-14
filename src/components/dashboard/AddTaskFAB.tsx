import { Plus } from "lucide-react";

interface AddTaskFABProps {
  onClick?: () => void;
}

export default function AddTaskFAB({ onClick }: AddTaskFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-team-olive to-team-oliveDark text-team-surface shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label="Add task"
    >
      <Plus size={24} />
    </button>
  );
}
