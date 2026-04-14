import type { FocusArea } from "@/types/dashboard";

interface FocusAreaCardProps {
  focusAreas: FocusArea[];
}

const dotStyles: Record<FocusArea["color"], string> = {
  olive: "bg-team-olive",
  oliveDark: "bg-team-oliveDark",
  contrast: "bg-team-contrast",
};

export default function FocusAreaCard({ focusAreas }: FocusAreaCardProps) {
  return (
    <div className="rounded-[1.5rem] bg-team-surface p-6 shadow-soft">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.24em] text-team-olive/90">Focus areas</p>
        <h2 className="mt-2 text-2xl font-semibold text-team-text">Team priorities</h2>
      </div>

      <div className="space-y-3">
        {focusAreas.map((area) => (
          <div
            key={area.id}
            className="flex items-center justify-between rounded-2xl px-2 py-3 transition-colors duration-200 hover:bg-team-bg"
          >
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-3.5 w-3.5 rounded-full ${dotStyles[area.color]}`} />
              <span className="text-sm font-semibold text-team-text">{area.label}</span>
            </div>
            <span className="text-sm text-team-text/70">{area.taskCount} tasks</span>
          </div>
        ))}
      </div>
    </div>
  );
}
