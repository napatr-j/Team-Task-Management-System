import { Task } from "@/types/calendar";
import TaskCard from "./TaskCard";

interface Props {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  tasks: Task[];
  onClick: () => void;
  onTaskClick: (task: Task) => void;
}

export default function CalendarCell({
  date,
  isToday,
  isSelected,
  isCurrentMonth,
  tasks,
  onClick,
  onTaskClick,
}: Props) {
  return (
    <div
      className={`min-h-[100px] rounded-lg p-2 flex flex-col gap-1 cursor-pointer transition duration-200
        ${isSelected ? "ring-2 ring-[#84934A]" : ""}
        ${isToday ? "bg-[#84934A] text-white" : isCurrentMonth ? "bg-[#ECECEC]" : "bg-[#ECECEC] opacity-60"}
        hover:shadow-lg hover:scale-[1.03]`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{date.getDate()}</span>
        {isToday && (
          <span className="bg-[#492828] text-white text-xs px-2 py-0.5 rounded-full">
            Today
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-1">
        {tasks.slice(0, 3).map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length > 3 && (
          <span className="text-xs text-[#84934A]">+{tasks.length - 3} more</span>
        )}
      </div>
    </div>
  );
}