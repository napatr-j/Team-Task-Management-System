"use client";

import { useEffect, useMemo, useState } from "react";
import TaskForm, { type GroupTask } from "./TaskForm";

interface GroupTaskBoardProps {
  groupId: string;
}

interface GroupMember {
  id: string;
  email: string | null;
  avatarUrl?: string | null;
}

const boardColumns: Array<{ key: GroupTask["status"]; title: string; accent: string }> = [
  { key: "todo", title: "To Do", accent: "bg-[#F4F3E9] text-[#8B7C48]" },
  { key: "in_progress", title: "In Progress", accent: "bg-[#EAF0E2] text-[#5F6B43]" },
  { key: "done", title: "Done", accent: "bg-[#F8E9E9] text-[#8E4E4E]" },
];

const statusLabel: Record<GroupTask["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const priorityClasses: Record<GroupTask["priority"], string> = {
  low: "bg-[#DCE8D8]/80 text-[#506446]",
  medium: "bg-[#F1E9BD]/80 text-[#766F38]",
  high: "bg-[#FECACA]/80 text-[#991B1B]",
};

export default function GroupTaskBoard({ groupId }: GroupTaskBoardProps) {
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [modalTask, setModalTask] = useState<GroupTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      setError(null);
      try {
        const response = await fetch(`/api/groups/${groupId}/tasks`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Unable to load tasks.");
        setTasks(data.tasks ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load tasks.");
      }
    }

    async function loadMembers() {
      try {
        const response = await fetch(`/api/groups/${groupId}/members`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Unable to load members.");
        setMembers(data.members ?? []);
      } catch (err) {
        console.warn(err);
      }
    }

    loadTasks();
    loadMembers();
  }, [groupId]);

  const columns = useMemo(
    () =>
      boardColumns.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.key).sort((a, b) => {
          if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
          if (a.deadline) return -1;
          if (b.deadline) return 1;
          return a.title.localeCompare(b.title);
        }),
      })),
    [tasks],
  );

  const refreshTasks = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/tasks`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to load tasks.");
      setTasks(data.tasks ?? data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks.");
    }
  };

  const updateTask = async (patch: { id: string; title?: string; description?: string; deadline?: string | null; priority?: GroupTask["priority"]; status?: GroupTask["status"]; assigneeIds?: string[]; subtasks?: Array<{ title: string; status: GroupTask["status"]; assigneeIds: string[] }> }) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/tasks/${patch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to update task.");
      await refreshTasks();
      setModalTask(null);
      setShowTaskModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update task.");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/tasks/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to delete task.");
      setTasks((current) => current.filter((task) => task.id !== id));
      setModalTask((current) => (current?.id === id ? null : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete task.");
    }
  };

  const handleSubmit = async (formData: {
    id?: string;
    title: string;
    description: string;
    deadline: string | null;
    priority: GroupTask["priority"];
    status: GroupTask["status"];
    assigneeIds?: string[];
    subtasks?: Array<{ title: string; status: GroupTask["status"]; assigneeIds: string[] }>;
  }) => {
    setError(null);
    setIsSaving(true);
    try {
      const method = formData.id ? "PATCH" : "POST";
      const url = formData.id
        ? `/api/groups/${groupId}/tasks/${formData.id}`
        : `/api/groups/${groupId}/tasks`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to save task.");
      await refreshTasks();
      setModalTask(null);
      setShowTaskModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save task.");
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (task: GroupTask, nextStatus: GroupTask["status"]) => {
    if (task.status === nextStatus) return;
    await updateTask({ id: task.id, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Task board</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Kanban board for your group</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">
              Move tasks through workflow stages, keep deadlines visible, and update status in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewTask}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#84934A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6a7b39]"
          >
            <span className="text-lg">+</span>
            New task
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#991B1B]">{error}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <div key={column.key} className="rounded-[24px] border border-[#E8E8E8] bg-[#F8F9FA] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${column.accent}`}>{column.title}</p>
                <p className="mt-2 text-sm text-[#4B5563]">{column.tasks.length} task{column.tasks.length === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {column.tasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-4 text-sm text-[#6B7280]">
                  No tasks in this lane.
                </div>
              ) : (
                column.tasks.map((task) => (
                  <article key={task.id} className="rounded-[24px] bg-white p-4 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827]">{task.title}</p>
                          <p className="mt-2 text-sm text-[#6B7280] line-clamp-2">{task.description || "No description."}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClasses[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#6B7280]">
                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No due date"}</span>
                        <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#525252]">
                          {statusLabel[task.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {boardColumns.map((column) => (
                          <button
                            key={column.key}
                            type="button"
                            onClick={() => changeStatus(task, column.key)}
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${task.status === column.key ? "bg-[#84934A] text-white" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7E7]"}`}
                          >
                            {column.key === task.status ? "Current" : column.title}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-2xl border border-[#D1D5DB] bg-[#F8FAFC] px-3 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#E5E7EB]"
                          onClick={() => openEditTask(task)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-2xl border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm font-semibold text-[#991B1B] transition hover:bg-[#FBCACA]"
                          onClick={() => handleDelete(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={openNewTask}
        aria-label="Add task"
        className="fixed bottom-8 right-8 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#84934A] text-2xl font-semibold text-white shadow-lg transition hover:bg-[#6a7b39]"
      >
        +
      </button>

      {showTaskModal ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/30 p-4">
          <div className="mx-auto w-full max-w-3xl">
            <TaskForm
              task={modalTask}
              users={members.filter((member) => Boolean(member.email)) as Array<{ id: string; email: string; avatarUrl?: string; initials?: string }>}
              onSubmit={handleSubmit}
              onCancel={closeTaskModal}
              submitting={isSaving}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
