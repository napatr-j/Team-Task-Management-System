import type { TimeFilter } from "@/types/dashboard";

interface TimeFilterToggleProps {
  activeFilter: TimeFilter;
  setActiveFilter: (value: TimeFilter) => void;
}

const filters: { label: string; value: TimeFilter }[] = [
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Next Week", value: "next_week" },
  { label: "Later", value: "later" },
];

export default function TimeFilterToggle({ activeFilter, setActiveFilter }: TimeFilterToggleProps) {
  return (
    <div className="inline-flex rounded-2xl bg-team-bg p-1 text-sm shadow-sm">
      {filters.map((filter) => {
        const active = filter.value === activeFilter;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-xl px-4 py-2 transition-all duration-200 ${
              active
                ? "bg-team-surface text-team-olive font-bold shadow-sm"
                : "text-team-text/70 hover:text-team-text"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
