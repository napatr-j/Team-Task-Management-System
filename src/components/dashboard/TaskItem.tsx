import Image from "next/image";
import { CalendarDays, CheckCircle2, Circle } from "lucide-react";
import type { Task } from "@/types/dashboard";

interface TaskItemProps {
  task: Task;
}

const badgeStyles: Record<NonNullable<Task["badge"]>, string> = {
  urgent: "bg-[#492828]/10 text-[#492828]",
  drafting: "bg-[#84934A]/10 text-[#656D3F]",
  meeting: "bg-[#656D3F]/10 text-[#656D3F]",
  review: "bg-[#84934A]/10 text-[#656D3F]",
};

export default function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="group flex flex-col gap-4 rounded-3xl border border-transparent bg-team-surface p-5 transition-all duration-200 hover:bg-team-bg">
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D1D5DB] text-team-text/80 transition-colors duration-200 hover:border-team-olive hover:text-team-olive"
          aria-label={`Mark ${task.title} as completed`}
        >
          {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-team-text">{task.title}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[task.badge]}`}>
              {task.badge}
            </span>
          </div>
          <p className="mt-2 text-sm text-team-text/60 line-clamp-2">{task.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-team-text/70">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
        <div className="flex -space-x-2">
          {task.assignees.map((assignee) => (
            <div
              key={assignee.id}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-team-surface bg-team-olive/10 text-[11px] font-semibold text-team-olive"
              title={assignee.initials ?? assignee.id}
            >
              {assignee.avatarUrl ? (
                <Image
                  alt={assignee.initials ?? "avatar"}
                  src={assignee.avatarUrl}
                  width={32}
                  height={32}
                  unoptimized
                  className="rounded-full object-cover"
                />
              ) : (
                assignee.initials ?? "?"
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
