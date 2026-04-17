import { Task, CalendarEvent } from "@/types/calendar";
import CalendarCell from "./CalendarCell";

interface Props {
  tasks: Task[];
  events?: CalendarEvent[];
  viewMode?: "tasks" | "events" | "both";
  selectedDate: Date | null;
  month: number;
  year: number;
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onEventClick: (event: CalendarEvent) => void;
  onMonthChange: (month: number, year: number) => void;
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  const matrix: Date[][] = [];

  for (let week = 0; week < 6; week++) {
    const weekRow: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + week * 7 + day);
      weekRow.push(date);
    }
    matrix.push(weekRow);
  }

  return matrix;
}

export default function CalendarGrid({
  tasks,
  events,
  viewMode = "both",
  selectedDate,
  month,
  year,
  onDateClick,
  onTaskClick,
  onEventClick,
  onMonthChange,
}: Props) {
  const matrix = getMonthMatrix(year, month);

  const handlePrev = () => {
    if (month === 0) {
      onMonthChange(11, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      onMonthChange(0, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <div className="bg-[#fff] rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-lg hover:bg-[#ECECEC] transition duration-200"
          onClick={handlePrev}
        >
          <span className="text-2xl">&lt;</span>
        </button>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">
          {new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          className="p-2 rounded-lg hover:bg-[#ECECEC] transition duration-200"
          onClick={handleNext}
        >
          <span className="text-2xl">&gt;</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[#84934A] font-medium pb-2">
            {d}
          </div>
        ))}
        {matrix.flat().map((date, idx) => {
          const showTasks = viewMode !== "events";
          const showEvents = viewMode !== "tasks";
          const dayTasks = showTasks
            ? tasks.filter((t) => new Date(t.deadline).toDateString() === date.toDateString())
            : [];
          const dayEvents = showEvents
            ? (events ?? []).filter((event) => new Date(event.start_time).toDateString() === date.toDateString())
            : [];
          return (
            <CalendarCell
              key={idx}
              date={date}
              isToday={isToday(date)}
              isSelected={
                selectedDate !== null &&
                date.toDateString() === selectedDate.toDateString()
              }
              tasks={dayTasks}
              events={dayEvents}
              onClick={() => onDateClick(date)}
              onTaskClick={onTaskClick}
              onEventClick={onEventClick}
              isCurrentMonth={date.getMonth() === month}
            />
          );
        })}
      </div>
    </div>
  );
}