import type { Task } from "@/types/dashboard";

interface TaskCompletionCadenceProps {
  tasks: Task[];
}

function getDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function TaskCompletionCadence({ tasks }: TaskCompletionCadenceProps) {
  const today = new Date();
  const days = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (364 - index));
    return date;
  });

  const activityByDay = tasks.reduce<Record<string, { total: number; completed: number }>>((acc, task) => {
    const date = new Date(task.dueDate);
    const key = getDayKey(date);
    const current = acc[key] ?? { total: 0, completed: 0 };
    current.total += 1;
    if (task.completed) current.completed += 1;
    acc[key] = current;
    return acc;
  }, {});

  const getBoxClasses = (date: Date) => {
    const stat = activityByDay[getDayKey(date)];
    if (!stat || stat.completed === 0) {
      return "bg-white border-team-olive/10";
    }
    if (stat.completed === stat.total) {
      return "bg-team-olive border-team-olive";
    }
    return "bg-team-olive/30 border-team-olive/10";
  };

  return (
    <div className="rounded-[1.5rem] bg-team-surface p-6 shadow-soft">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-left">
          <p className="text-lg font-semibold text-team-text">Task completion cadence</p>
          <p className="text-sm text-team-text/70">A year view of your completed task updates.</p>
        </div>

        <div className="overflow-x-auto">
          <div className="grid auto-cols-min grid-flow-col grid-rows-7 gap-1">
            {days.map((date) => (
              <div
                key={getDayKey(date)}
                className={`h-5 w-5 rounded-sm border ${getBoxClasses(date)}`}
                title={`${date.toDateString()} • ${activityByDay[getDayKey(date)]?.completed ?? 0} / ${
                  activityByDay[getDayKey(date)]?.total ?? 0
                } tasks completed`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-team-text/60">
          <span>No done updates</span>
          <span className="bg-team-olive/30 px-2 py-1 rounded-full">Some done updates</span>
          <span className="bg-team-olive px-2 py-1 rounded-full text-white">All done updates</span>
        </div>
      </div>
    </div>
  );
}
