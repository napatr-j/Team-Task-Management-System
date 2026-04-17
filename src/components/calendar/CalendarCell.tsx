import { Task, CalendarEvent } from "@/types/calendar";
import TaskCard from "./TaskCard";
import EventCard from "./EventCard";

interface Props {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  tasks: Task[];
  events: CalendarEvent[];
  onClick: () => void;
  onTaskClick: (task: Task) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarCell({
  date,
  isToday,
  isSelected,
  isCurrentMonth,
  tasks,
  events,
  onClick,
  onTaskClick,
  onEventClick,
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
        {tasks.slice(0, 2).map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {events.slice(0, 2).map((event) => (
          <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
        ))}
        {tasks.length + events.length > 3 && (
          <span className="text-xs text-[#84934A]">+{tasks.length + events.length - 3} more</span>
        )}
      </div>
    </div>
  );
}