"use client";

import { useEffect, useState } from "react";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import DayDetails from "@/components/calendar/DayDetails";
import ProgressPanel from "@/components/calendar/ProgressPanel";
import AddTaskModal from "@/components/calendar/AddTaskModal";
import TaskModal from "@/components/calendar/TaskModal";
import { Task, User } from "@/types/calendar";

interface CalendarWorkspaceProps {
  groupId?: string;
}

export default function CalendarWorkspace({ groupId }: CalendarWorkspaceProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const now = selectedDate || new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear());
        const query = `/api/tasks?month=${month}&year=${year}${groupId ? `&team_id=${groupId}` : ""}`;
        const tasksRes = await fetch(query);
        const grouped = (await tasksRes.json()) as Record<string, Task[]>;
        const allTasks = Object.values(grouped).flat();
        setTasks(allTasks);

        const usersRes = await fetch("/api/users");
        setUsers(await usersRes.json());
      } catch (error) {
        console.error("Unable to load calendar data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDate, groupId]);

  const handleDateClick = (date: Date) => setSelectedDate(date);
  const handleTaskClick = (task: Task) => setActiveTask(task);

  const handleAddTask = async (task: Task) => {
    const payload = groupId ? { ...task, team_id: groupId } : task;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const newTask = await res.json();
    setTasks((current) => [...current, newTask]);
    setShowAddTask(false);
  };

  const handleUpdateTask = async (updated: Task) => {
    await fetch(`/api/tasks/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
    setActiveTask(null);
  };

  return (
    <div className="min-h-screen bg-[#ECECEC]">
      <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 p-8">
        <section className="flex flex-col gap-6 xl:flex-row">
          <div className="flex-1">
            <CalendarGrid
              tasks={tasks}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onTaskClick={handleTaskClick}
            />
          </div>
          <aside className="w-full xl:w-80">
            <ProgressPanel date={selectedDate} tasks={tasks} />
          </aside>
        </section>

        <button
          className="fixed bottom-8 right-8 z-20 rounded-full bg-[#84934A] p-5 text-white shadow-lg transition duration-200 hover:bg-[#656D3F] hover:scale-105 focus:outline-none"
          onClick={() => setShowAddTask(true)}
          aria-label="Add Task"
        >
          <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M14 7v14M7 14h14" />
          </svg>
        </button>

        {showAddTask && (
          <AddTaskModal
            users={users}
            onClose={() => setShowAddTask(false)}
            onAdd={handleAddTask}
            tasks={tasks}
          />
        )}

        {activeTask && (
          <TaskModal
            task={activeTask}
            users={users}
            onClose={() => setActiveTask(null)}
            onUpdate={handleUpdateTask}
          />
        )}
      </main>
    </div>
  );
}
