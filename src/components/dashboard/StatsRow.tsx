import { ArrowUpRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

interface StatsRowProps {
  stats: DashboardStats;
  onAddTask: () => void;
  onOverdueClick: () => void;
  onDueClick: () => void;
  onProgressClick: () => void;
}

export default function StatsRow({ stats, onAddTask, onOverdueClick, onDueClick, onProgressClick }: StatsRowProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <button
        type="button"
        onClick={onOverdueClick}
        className="rounded-3xl bg-[#3F5B1F] p-6 text-team-surface shadow-soft transition-all duration-200 hover:bg-[#365214] text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15 text-team-surface">
            <ArrowUpRight size={20} />
          </div>
          <span className="text-sm text-white/80">Overdue</span>
        </div>
        <p className="mt-6 text-4xl font-semibold text-team-surface">{stats.overdue}</p>
        <p className="mt-2 text-sm text-white/80">Tasks that pass deadline</p>
      </button>

      <button
        type="button"
        onClick={onDueClick}
        className="rounded-3xl bg-gradient-to-br from-team-olive to-team-oliveDark p-6 text-team-surface shadow-xl text-left transition-all duration-200 hover:brightness-110"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15">
            <Zap size={20} />
          </div>
          <span className="text-sm text-white/80">Due in 24h</span>
        </div>
        <p className="mt-6 text-4xl font-semibold">{stats.priority}</p>
        <p className="mt-2 text-sm text-white/80">Tasks due soon</p>
      </button>

      <button
        type="button"
        onClick={onProgressClick}
        className="rounded-3xl bg-team-surface p-6 shadow-soft transition-all duration-200 hover:bg-team-bg text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-team-olive/10 text-team-olive">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-sm text-team-text/70">In Progress</span>
        </div>
        <p className="mt-6 text-4xl font-semibold text-team-text">{stats.inProgress}</p>
        <p className="mt-2 text-sm text-team-text/60">Tasks still active</p>
      </button>

      <button
        type="button"
        onClick={onAddTask}
        className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-team-olive/30 bg-team-surface p-6 text-center transition-all duration-200 hover:border-team-olive"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-team-olive/10 text-team-olive transition-colors duration-200 group-hover:bg-team-olive group-hover:text-team-surface">
          <Sparkles size={20} />
        </div>
        <p className="mt-5 text-lg font-semibold text-team-text">New Task</p>
        <p className="mt-2 text-sm text-team-text/60">Coming soon</p>
      </button>
    </div>
  );
}
