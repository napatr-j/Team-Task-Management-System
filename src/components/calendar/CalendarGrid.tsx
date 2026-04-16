import { Task } from "@/types/calendar";
import CalendarCell from "./CalendarCell";
import { useState } from "react";

interface Props {
  tasks: Task[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: Date[][] = [];
  let week: Date[] = [];
  let day = new Date(firstDay);

  // Fill first week
  for (let i = 0; i < firstDay.getDay(); i++) {
    week.push(new Date(year, month, i - firstDay.getDay() + 1));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  // Fill last week
  if (week.length) {
    for (let i = week.length; i < 7; i++) {
      week.push(new Date(year, month + 1, i - week.length + 1));
    }
    matrix.push(week);
  }
  return matrix;
}

export default function CalendarGrid({
  tasks,
  selectedDate,
  onDateClick,
  onTaskClick,
}: Props) {
  const [month, setMonth] = useState(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [year, setYear] = useState(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );

  const matrix = getMonthMatrix(year, month);

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
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
          const dayTasks = tasks.filter(
            (t) =>
              new Date(t.deadline).toDateString() === date.toDateString()
          );
          return (
            <CalendarCell
              key={idx}
              date={date}
              isToday={isToday(date)}
              isSelected={
                selectedDate &&
                date.toDateString() === selectedDate.toDateString()
              }
              tasks={dayTasks}
              onClick={() => onDateClick(date)}
              onTaskClick={onTaskClick}
              isCurrentMonth={date.getMonth() === month}
            />
          );
        })}
      </div>
    </div>
  );
}