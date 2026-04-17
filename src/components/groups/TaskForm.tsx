"use client";

import { useEffect, useState } from "react";

export type GroupSubtask = {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  assignees: Array<{ id: string; avatarUrl?: string; initials?: string; email?: string }>;
};

export type GroupTask = {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  assignees: Array<{ id: string; avatarUrl?: string; initials?: string; email?: string }>;
  parent_task_id?: string;
  subtasks?: GroupSubtask[];
};

type ParentTask = {
  id: string;
  title: string;
  deadline?: string | null;
  parent_task_id?: string | null;
};

interface TaskFormProps {
  task?: GroupTask | null;
  users: Array<{ id: string; email?: string | null; avatarUrl?: string; initials?: string }>;
  availableParentTasks?: ParentTask[];
  onSubmit: (task: {
    id?: string;
    title: string;
    description: string;
    deadline: string | null;
    priority: "low" | "medium" | "high";
    status: "todo" | "in_progress" | "done";
    assigneeIds?: string[];
    parentTaskId?: string;
    subtasks?: Array<{
      title: string;
      description?: string;
      deadline?: string | null;
      priority: "low" | "medium" | "high";
      status: "todo" | "in_progress" | "done";
      assigneeIds: string[];
    }>;
  }) => void;
  onCancel?: () => void;
  submitting?: boolean;
}

export default function TaskForm({ task, users, availableParentTasks = [], onSubmit, onCancel, submitting }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const minDeadline = task ? undefined : new Date().toISOString().slice(0, 10);
  const [priority, setPriority] = useState<GroupTask["priority"]>(task?.priority ?? "medium");
  const [status, setStatus] = useState<GroupTask["status"]>(task?.status ?? "todo");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assignees?.map((assignee) => assignee.id) ?? []);
  const [parentTaskId, setParentTaskId] = useState<string>(task?.parent_task_id ?? "");
  const [parentTaskSearch, setParentTaskSearch] = useState<string>("");
  const [subtasks, setSubtasks] = useState<Array<{
    title: string;
    description: string;
    deadline: string;
    priority: GroupTask["priority"];
    status: GroupTask["status"];
    assigneeIds: string[];
  }>>(
    (task?.subtasks ?? []).map((subtask) => ({
      title: subtask.title,
      description: subtask.description ?? "",
      deadline: subtask.deadline ?? "",
      priority: subtask.priority ?? "medium",
      status: subtask.status,
      assigneeIds: subtask.assignees?.map((assignee) => assignee.id) ?? [],
    })),
  );

  useEffect(() => {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setDeadline(task?.deadline ?? "");
    setPriority(task?.priority ?? "medium");
    setStatus(task?.status ?? "todo");
    setAssigneeIds(task?.assignees?.map((assignee) => assignee.id) ?? []);
    setParentTaskId(task?.parent_task_id ?? "");
    setParentTaskSearch("");
    setSubtasks(
      (task?.subtasks ?? []).map((subtask) => ({
        title: subtask.title,
        description: subtask.description ?? "",
        deadline: subtask.deadline ?? "",
        priority: subtask.priority ?? "medium",
        status: subtask.status,
        assigneeIds: subtask.assignees?.map((assignee) => assignee.id) ?? [],
      })),
    );
  }, [task]);

  const updateSubtask = (index: number, field: string, value: string) => {
    setSubtasks((current) =>
      current.map((subtask, idx) =>
        idx === index ? { ...subtask, [field]: value } : subtask,
      ),
    );
  };

  const toggleSubtaskAssignee = (subtaskIndex: number, userId: string) => {
    setSubtasks((current) =>
      current.map((subtask, idx) => {
        if (idx !== subtaskIndex) return subtask;
        const hasAssignee = subtask.assigneeIds.includes(userId);
        return {
          ...subtask,
          assigneeIds: hasAssignee
            ? subtask.assigneeIds.filter((id) => id !== userId)
            : [...subtask.assigneeIds, userId],
        };
      }),
    );
  };

  const addSubtask = () => {
    setSubtasks((current) => [...current, { title: "", description: "", deadline: "", priority: "medium", status: "todo", assigneeIds: [] }]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks((current) => current.filter((_, idx) => idx !== index));
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || null,
      priority,
      status,
      assigneeIds,
      parentTaskId: parentTaskId || undefined,
      subtasks: subtasks.length > 0
        ? subtasks.map((subtask) => ({
            title: subtask.title.trim(),
            description: subtask.description.trim() || undefined,
            deadline: subtask.deadline || null,
            priority: subtask.priority,
            status: subtask.status,
            assigneeIds: subtask.assigneeIds,
          }))
        : undefined,
    });
  };

  const today = new Date().toISOString().slice(0, 10);
  const parentTaskCandidates = availableParentTasks
    .filter((candidate) =>
      candidate.id !== task?.id &&
      !candidate.parent_task_id &&
      candidate.deadline &&
      candidate.deadline.slice(0, 10) >= today,
    );
  const filteredParentTasks = parentTaskCandidates.filter((candidate) =>
    candidate.title.toLowerCase().includes(parentTaskSearch.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#E6E8EB] bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#7A7A7A]">{task ? "Edit task" : "New task"}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#111827]">{task ? "Update task details" : "Create a new task"}</h2>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-[#374151]">
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            placeholder="Task title"
            required
          />
        </label>

        <label className="block text-sm font-medium text-[#374151]">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 h-24 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            placeholder="Describe the task"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#374151]">
            Due date
            <input
              type="date"
              min={minDeadline}
              value={deadline ? deadline.slice(0, 10) : ""}
              onChange={(event) => setDeadline(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            />
          </label>

          <label className="block text-sm font-medium text-[#374151]">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as GroupTask["priority"])}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-[#374151]">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as GroupTask["status"])}
            className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[#374151]">Assign users</p>
          <p className="text-xs text-[#6B7280]">Select one or more members to assign to this task.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {users.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No group members available yet.</p>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleAssignee(user.id)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${assigneeIds.includes(user.id) ? "border-[#84934A] bg-[#EAF0E2] text-[#1F4330]" : "border-[#D1D5DB] bg-[#F8FAFC] text-[#374151] hover:bg-[#EFF3EE]"}`}
                >
                  {user.email ?? user.initials ?? user.id}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-[#D1D5DB] bg-[#F8FAFB] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#374151]">Subtasks</p>
            <button
              type="button"
              onClick={addSubtask}
              className="rounded-full border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#374151] transition hover:bg-[#EFF3EE]"
            >
              + Add
            </button>
          </div>

          {subtasks.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Add subtasks to break this task into smaller work items.</p>
          ) : (
            subtasks.map((subtask, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#374151]">
                    Subtask title
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(event) => updateSubtask(index, "title", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                      placeholder="Subtask title"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[#374151]">
                    Status
                    <select
                      value={subtask.status}
                      onChange={(event) => updateSubtask(index, "status", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#374151]">
                    Due date
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={subtask.deadline}
                      onChange={(event) => updateSubtask(index, "deadline", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[#374151]">
                    Priority
                    <select
                      value={subtask.priority}
                      onChange={(event) => updateSubtask(index, "priority", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-[#374151]">
                  Description
                  <textarea
                    value={subtask.description}
                    onChange={(event) => updateSubtask(index, "description", event.target.value)}
                    className="mt-2 h-20 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                    placeholder="Subtask description"
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#374151]">Assign users</p>
                  <div className="flex flex-wrap gap-2">
                    {users.map((user) => {
                      const selected = subtask.assigneeIds.includes(user.id);
                      return (
                        <button
                          key={`${index}-${user.id}`}
                          type="button"
                          onClick={() => toggleSubtaskAssignee(index, user.id)}
                          className={`rounded-full border px-3 py-2 text-sm transition ${selected ? "border-[#84934A] bg-[#EAF0E2] text-[#1F4330]" : "border-[#D1D5DB] bg-[#F8FAFC] text-[#374151] hover:bg-[#EFF3EE]"}`}
                        >
                          {user.email ?? user.initials ?? user.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="text-sm font-semibold text-[#991B1B] transition hover:text-[#7F1D1D]"
                >
                  Remove subtask
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-[#D1D5DB] bg-[#F8FAFB] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#374151]">Parent task</p>
            <span className="text-xs text-[#6B7280]">Choose an existing task with a future deadline.</span>
          </div>

          <label className="block text-sm font-medium text-[#374151]">
            Search parent tasks
            <input
              type="search"
              value={parentTaskSearch}
              onChange={(event) => setParentTaskSearch(event.target.value)}
              placeholder="Search by title"
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            />
          </label>

          <label className="block text-sm font-medium text-[#374151]">
            Select parent task
            <select
              value={parentTaskId}
              onChange={(event) => setParentTaskId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            >
              <option value="">No parent task</option>
              {filteredParentTasks.map((parentTask) => (
                <option key={parentTask.id} value={parentTask.id}>
                  {parentTask.title} — {parentTask.deadline ? new Date(parentTask.deadline).toLocaleDateString() : "No deadline"}
                </option>
              ))}
            </select>
          </label>

          {parentTaskSearch && filteredParentTasks.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No matching tasks found.</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-[#84934A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6a7b39] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : task ? "Save changes" : "Create task"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
