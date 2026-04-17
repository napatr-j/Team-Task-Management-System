"use client";

import { useEffect, useState } from "react";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import MonthTaskDetails from "@/components/calendar/MonthTaskDetails";
import ProgressPanel from "@/components/calendar/ProgressPanel";
import TaskForm from "@/components/groups/TaskForm";
import TaskModal from "@/components/calendar/TaskModal";
import AddEventModal from "./AddEventModal";
import EventModal from "./EventModal";
import { Task, TaskPriority, TaskStatus, User, CalendarEvent } from "@/types/calendar";

interface CalendarWorkspaceProps {
  groupId?: string;
}

export default function CalendarWorkspace({ groupId }: CalendarWorkspaceProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [canCreateTasks, setCanCreateTasks] = useState(true);
  const [canCreateEvents, setCanCreateEvents] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<"tasks" | "events" | "both">("both");
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let allTasks: Task[] = [];
        if (groupId) {
          const taskRes = await fetch(`/api/groups/${groupId}/tasks`);
          const taskData = await taskRes.json();
          allTasks = Array.isArray(taskData.tasks) ? taskData.tasks : [];
        } else {
          const taskQuery = `/api/tasks?month=${String(month + 1).padStart(2, "0")}&year=${String(year)}`;
          const taskRes = await fetch(taskQuery);
          const taskGrouped = (await taskRes.json()) as Record<string, Task[]>;
          allTasks = Object.values(taskGrouped).flat();
        }
        setTasks(allTasks);

        if (groupId) {
          const eventQuery = `/api/groups/${groupId}/events?month=${String(month + 1).padStart(2, "0")}&year=${String(year)}`;
          const [membersRes, eventRes] = await Promise.all([
            fetch(`/api/groups/${groupId}/members`),
            fetch(eventQuery),
          ]);

          if (membersRes.ok) {
            const membersData = await membersRes.json();
            const groupUsers = Array.isArray(membersData.members) ? membersData.members : [];
            setUsers(
              groupUsers.map((member: any) => ({
                id: member.id,
                email: member.email,
                name: member.email ?? "Unknown",
                role: "member",
              })),
            );
            setCanCreateTasks(Boolean(membersData.canCreateTasks));
            setCanCreateEvents(true);
          } else {
            setUsers([]);
            setCanCreateTasks(false);
            setCanCreateEvents(false);
          }

          if (eventRes.ok) {
            const eventGrouped = (await eventRes.json()) as Record<string, CalendarEvent[]>;
            setEvents(Object.values(eventGrouped).flat());
          } else {
            setEvents([]);
          }
        } else {
          const usersRes = await fetch("/api/users");
          setUsers(await usersRes.json());
          setCanCreateTasks(true);
          setCanCreateEvents(false);
          setEvents([]);
        }
      } catch (error) {
        console.error("Unable to load calendar data", error);
        if (groupId) {
          setUsers([]);
          setCanCreateTasks(false);
          setCanCreateEvents(false);
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [month, year, groupId]);

  const handleDateClick = (date: Date) => setSelectedDate(date);
  const handleTaskClick = (task: Task) => setActiveTask(task);
  const handleMonthChange = (nextMonth: number, nextYear: number) => {
    setMonth(nextMonth);
    setYear(nextYear);
    setSelectedDate(new Date(nextYear, nextMonth, 1));
  };

  const handleAddTask = async (formData: {
    id?: string;
    title: string;
    description: string;
    deadline: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    assigneeIds?: string[];
    parentTaskId?: string;
    subtasks?: Array<{
      title: string;
      description?: string;
      deadline?: string | null;
      priority: TaskPriority;
      status: TaskStatus;
      assigneeIds: string[];
    }>;
  }) => {
    const assigneeEmails = formData.assigneeIds
      ? formData.assigneeIds
          .map((id) => users.find((user) => user.id === id)?.email)
          .filter((email): email is string => Boolean(email))
      : [];

    const payload = {
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline,
      priority: formData.priority,
      status: formData.status,
      assigned_to: assigneeEmails.length > 0 ? assigneeEmails : undefined,
      team_id: groupId ?? undefined,
      parent_task_id: formData.parentTaskId ?? undefined,
      subtasks: formData.subtasks?.map((subtask) => ({
        title: subtask.title,
        description: subtask.description ?? null,
        deadline: subtask.deadline ?? null,
        priority: subtask.priority,
        status: subtask.status,
        assigneeIds: subtask.assigneeIds,
      })),
    };

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const newTask = await res.json();
    setTasks((current) => [...current, newTask]);
    setShowAddTask(false);
  };

  const handleAddEvent = async (eventData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    participantIds?: string[];
  }) => {
    if (!groupId) return;

    const res = await fetch(`/api/groups/${groupId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    const newEvent = await res.json();
    setEvents((current) => [...current, newEvent]);
    setShowAddEvent(false);
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

  const handleUpdateEvent = async (updated: CalendarEvent) => {
    if (!groupId) return;
    await fetch(`/api/groups/${groupId}/events/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setEvents((current) => current.map((event) => (event.id === updated.id ? updated : event)));
    setActiveEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!groupId) return;
    await fetch(`/api/groups/${groupId}/events/${eventId}`, {
      method: "DELETE",
    });
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setActiveEvent(null);
  };

  return (
    <div className="min-h-screen bg-[#ECECEC]">
      <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 p-8">
        <section className="flex flex-col gap-6 xl:flex-row">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
                {([
                  { label: "Tasks", value: "tasks" },
                  { label: "Events", value: "events" },
                  { label: "Both", value: "both" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      viewMode === option.value
                        ? "bg-[#84934A] text-white"
                        : "text-[#374151] hover:bg-[#F3F4F6]"
                    }`}
                    onClick={() => setViewMode(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
                  type="button"
                  onClick={() => setShowAddTask(true)}
                  disabled={groupId ? !canCreateTasks : false}
                >
                  Add Task
                </button>
                {groupId && canCreateEvents && (
                  <button
                    className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
                    type="button"
                    onClick={() => setShowAddEvent(true)}
                  >
                    Add Event
                  </button>
                )}
              </div>
            </div>
            <CalendarGrid
              tasks={tasks}
              events={events}
              viewMode={viewMode}
              selectedDate={selectedDate}
              month={month}
              year={year}
              onDateClick={handleDateClick}
              onTaskClick={handleTaskClick}
              onEventClick={(event) => setActiveEvent(event)}
              onMonthChange={handleMonthChange}
            />
          </div>
          <aside className="w-full xl:w-80">
            <ProgressPanel date={selectedDate} tasks={tasks} />
            <MonthTaskDetails
              month={month}
              year={year}
              selectedDate={selectedDate}
              tasks={tasks}
              events={events}
              onTaskClick={handleTaskClick}
              onEventClick={(event) => setActiveEvent(event)}
            />
          </aside>
        </section>

        <div className="fixed bottom-8 right-8 z-20 flex flex-col gap-3">
          <button
            className="rounded-full bg-[#84934A] p-5 text-white shadow-lg transition duration-200 hover:bg-[#656D3F] hover:scale-105 focus:outline-none disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={() => setShowAddTask(true)}
            aria-label={groupId && !canCreateTasks ? "Cannot add task" : "Add Task"}
            disabled={groupId ? !canCreateTasks : false}
          >
            <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 7v14M7 14h14" />
            </svg>
          </button>
          {groupId && canCreateEvents && (
            <button
              className="rounded-full bg-white p-5 text-[#374151] shadow-lg transition duration-200 hover:bg-[#F3F4F6] hover:scale-105 focus:outline-none"
              onClick={() => setShowAddEvent(true)}
              aria-label="Add Event"
            >
              <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 8h18M12 3v10" />
              </svg>
            </button>
          )}
        </div>

        {showAddTask && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black/30 p-4">
            <div className="mx-auto w-full max-w-3xl">
              {groupId && loadingMembers ? (
                <div className="rounded-[24px] border border-[#E6E8EB] bg-white p-8 text-center text-sm text-[#6B7280] shadow-sm">
                  Loading group members...
                </div>
              ) : (
                <TaskForm
                  users={users.map((user) => ({
                    id: user.id,
                    email: user.email ?? undefined,
                    avatarUrl: undefined,
                  }))}
                  availableParentTasks={tasks}
                  onSubmit={handleAddTask}
                  onCancel={() => setShowAddTask(false)}
                  submitting={false}
                />
              )}
            </div>
          </div>
        )}

        {showAddEvent && (
          <AddEventModal
            users={users}
            onAdd={handleAddEvent}
            onClose={() => setShowAddEvent(false)}
          />
        )}

        {groupId && !canCreateTasks ? (
          <div className="fixed bottom-24 right-8 z-20 rounded-xl border border-[#F1F5F9] bg-white p-3 text-sm text-[#6B7280] shadow-lg">
            Only group Admin or Manager can create tasks.
          </div>
        ) : null}

        {activeTask && (
          <TaskModal
            task={activeTask}
            users={users}
            onClose={() => setActiveTask(null)}
            onUpdate={handleUpdateTask}
          />
        )}
        {activeEvent && (
          <EventModal
            event={activeEvent}
            users={users}
            onClose={() => setActiveEvent(null)}
            onUpdate={handleUpdateEvent}
            onDelete={() => handleDeleteEvent(activeEvent.id)}
          />
        )}
      </main>
    </div>
  );
}
