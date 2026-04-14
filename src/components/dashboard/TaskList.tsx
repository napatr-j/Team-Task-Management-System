"use client";

import { useMemo, useState } from "react";
import TaskItem from "@/components/dashboard/TaskItem";
import type { Task } from "@/types/dashboard";

interface TaskListProps {
  tasks: Task[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TaskList({ tasks }: TaskListProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [tasks],
  );

  const monthStart = useMemo(() => new Date(currentYear, currentMonth, 1), [currentYear, currentMonth]);
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const monthWeekdayStart = monthStart.getDay();

  const days = useMemo(() => {
    const calendar: Array<{ label: string; date?: Date }> = [];
    for (let emptyIndex = 0; emptyIndex < monthWeekdayStart; emptyIndex += 1) {
      calendar.push({ label: "" });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      calendar.push({ label: String(day), date: new Date(currentYear, currentMonth, day) });
    }
    return calendar;
  }, [monthWeekdayStart, daysInMonth, currentMonth, currentYear]);

  const tasksByDate = useMemo(() => {
    return sortedTasks.reduce<Record<string, number>>((acc, task) => {
      const due = new Date(task.dueDate);
      const key = `${due.getFullYear()}-${due.getMonth()}-${due.getDate()}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [sortedTasks]);

  const prevMonth = () => {
    setCurrentMonth((month) => {
      if (month === 0) {
        setCurrentYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((month) => {
      if (month === 11) {
        setCurrentYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  };

  return (
    <section className="rounded-[1.5rem] bg-team-surface p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-team-olive/90">Calendar view</p>
          <h2 className="mt-2 text-2xl font-semibold text-team-text">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-team-olive/20 bg-team-bg px-3 py-2">
          <button
            type="button"
            onClick={prevMonth}
            disabled={currentMonth === 0}
            className="rounded-full px-3 py-2 text-sm font-semibold text-team-text transition-colors duration-200 hover:bg-team-olive/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={nextMonth}
            disabled={currentMonth === 11}
            className="rounded-full px-3 py-2 text-sm font-semibold text-team-text transition-colors duration-200 hover:bg-team-olive/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-team-olive/15 bg-team-bg p-5">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-team-text/60">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday}>{weekday}</div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((cell, index) => {
            const isToday = cell.date ? cell.date.toDateString() === today.toDateString() : false;
            const taskCount = cell.date
              ? tasksByDate[`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`]
              : 0;

            return (
              <div
                key={`${cell.label}-${index}`}
                className={`min-h-[76px] rounded-2xl border p-3 text-left transition-all duration-200 ${
                  cell.label ? "bg-white" : "bg-transparent border-transparent"
                } ${isToday ? "border-team-olive bg-team-olive/10" : "border-team-olive/10"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-semibold ${isToday ? "text-team-olive" : "text-team-text"}`}>
                    {cell.label}
                  </span>
                  {taskCount > 0 && (
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-team-olive text-[10px] font-semibold text-team-surface">
                      {taskCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="rounded-3xl border border-team-olive/20 bg-team-bg p-6 text-center text-sm text-team-text/70">
            No tasks found for this filter.
          </div>
        ) : (
          sortedTasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
}
