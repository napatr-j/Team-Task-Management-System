import { Task } from "@/types/calendar";

interface Props {
  date: Date | null;
  tasks: Task[];
}

export default function ProgressPanel({ date, tasks }: Props) {
  if (!date) return null;
  const dayTasks = tasks.filter(
    (t) => new Date(t.deadline).toDateString() === date.toDateString()
  );
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.status === "done").length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-[#fff] rounded-xl shadow p-6">
      <h4 className="font-semibold text-[#84934A] mb-4">Progress</h4>
      <div className="mb-2 text-sm text-[#1A1A1A]">
        {completed} / {total} tasks completed
      </div>
      <div className="w-full bg-[#ECECEC] rounded-full h-4 mb-4">
        <div
          className="h-4 rounded-full transition-all duration-200"
          style={{
            width: `${percent}%`,
            background: "#84934A",
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>{percent}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}