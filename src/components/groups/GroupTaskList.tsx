"use client";

import { useEffect, useMemo, useState } from "react";
import TaskForm, { type GroupTask } from "./TaskForm";

interface GroupTaskListProps {
  groupId: string;
}

interface GroupMember {
  id: string;
  email: string | null;
  avatarUrl?: string | null;
}

const statusLabels: Record<GroupTask["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const priorityClasses: Record<GroupTask["priority"], string> = {
  low: "bg-[#DCE8D8] text-[#506446]",
  medium: "bg-[#F1E9BD] text-[#766F38]",
  high: "bg-[#FEE2E2] text-[#981B1B]",
};

export default function GroupTaskList({ groupId }: GroupTaskListProps) {
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [modalTask, setModalTask] = useState<GroupTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [canCreateTasks, setCanCreateTasks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return a.title.localeCompare(b.title);
    }),
    [tasks],
  );

  const pendingTasks = useMemo(
    () => sortedTasks.filter((task) => task.status !== "done"),
    [sortedTasks],
  );

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
        setCanCreateTasks(Boolean(data.canCreateTasks));
      } catch (err) {
        console.warn(err);
        setMembers([]);
        setCanCreateTasks(false);
      }
    }

    loadTasks();
    loadMembers();
  }, [groupId]);

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

  const openNewTask = () => {
    setModalTask(null);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setModalTask(null);
  };

  const handleSubmit = async (formData: {
    id?: string;
    title: string;
    description: string;
    deadline: string | null;
    priority: GroupTask["priority"];
    status: GroupTask["status"];
    assigneeIds?: string[];
    parentTaskId?: string;
    subtasks?: Array<{ title: string; description?: string; deadline?: string | null; priority?: GroupTask["priority"]; status: GroupTask["status"]; assigneeIds: string[] }>;
  }) => {
    setError(null);
    setSuccessMessage(null);
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
      closeTaskModal();
      setSuccessMessage(formData.id ? "Task updated successfully." : "Task created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setSuccessMessage(null);

    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/tasks/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to delete task.");
      setTasks((current) => current.filter((task) => task.id !== id));
      if (modalTask?.id === id) closeTaskModal();
      setSuccessMessage("Task deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete task.");
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Task list</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Group task feed</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">
              Browse and manage your group tasks, deadlines, and status updates from one shared board.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewTask}
            disabled={!canCreateTasks}
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition disabled:bg-[#D1D5DB] disabled:text-[#6B7280]"
            style={{ backgroundColor: canCreateTasks ? "#84934A" : "#F3F4F6" }}
          >
            <span className="text-lg">+</span>
            {canCreateTasks ? "New task" : "Create disabled"}
          </button>
          {!canCreateTasks ? (
            <div className="mt-3 text-sm text-[#6B7280]">Only Admin or Manager can create tasks.</div>
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
{successMessage ? (
        <div className="rounded-3xl border border-[#D1FAE5] bg-[#ECFDF5] p-5 text-sm text-[#065F46]">{successMessage}</div>
      ) : null}
      {error ? (
          <div className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#991B1B]">{error}</div>
        ) : null}

        <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <p className="text-sm font-semibold text-[#111827]">Upcoming tasks</p>
          <p className="mt-2 text-sm text-[#6B7280]">{pendingTasks.length} active task{pendingTasks.length === 1 ? "" : "s"}.</p>
        </div>

        <div className="grid gap-4">
          {sortedTasks.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#D1D5DB] bg-white p-8 text-center text-sm text-[#6B7280]">
              No tasks found for this group yet.
            </div>
          ) : (
            sortedTasks.map((task) => (
              <article key={task.id} className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827]">{task.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4B5563] line-clamp-2">{task.description || "No description provided."}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#374151]">
                    <span className="rounded-full bg-[#F3F4F6] px-3 py-1">{statusLabels[task.status]}</span>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${priorityClasses[task.priority]}`}>{task.priority}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                    <div>Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</div>
                    <div>{task.subtasks?.length ?? 0} subtask{(task.subtasks?.length ?? 0) === 1 ? "" : "s"}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {task.assignees.length > 0 ? (
                      <div className="flex items-center gap-2">
                        {task.assignees.slice(0, 2).map((assignee) => (
                          <span
                            key={assignee.id}
                            title={assignee.email ?? assignee.id}
                            className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-[#F3F4F6] px-2 text-xs font-semibold text-[#374151]"
                          >
                            {assignee.initials ?? assignee.id.slice(0, 2).toUpperCase()}
                          </span>
                        ))}
                        {task.assignees.length > 2 && (
                          <span className="text-xs text-[#6B7280]">+{task.assignees.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-[#6B7280]">Unassigned</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-[#D1D5DB] bg-[#F8FAFC] px-3 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#E5E7EB]"
                      onClick={() => {
                        setModalTask(task);
                        setShowTaskModal(true);
                      }}
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
      </section>

      {canCreateTasks ? (
        <button
          type="button"
          onClick={openNewTask}
          aria-label="Add task"
          className="fixed bottom-8 right-8 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#84934A] text-2xl font-semibold text-white shadow-lg transition hover:bg-[#6a7b39]"
        >
          +
        </button>
      ) : null}

      {showTaskModal ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/30 p-4">
          <div className="mx-auto w-full max-w-3xl">
            <TaskForm
              task={modalTask}
              users={members.map((member) => ({
                id: member.id,
                email: member.email ?? undefined,
                avatarUrl: member.avatarUrl ?? undefined,
              }))}
              availableParentTasks={tasks}
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
