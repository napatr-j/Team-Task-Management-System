import { Task, User } from "@/types/calendar";
import { useMemo, useState } from "react";
import SubtaskForm from "./SubtaskForm";

interface Props {
  users: User[];
  onClose: () => void;
  onAdd: (task: Task) => void;
  tasks: Task[];
}

export default function AddTaskModal({ users, onClose, onAdd, tasks }: Props) {
  const minDeadline = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [deadline, setDeadline] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    users.length > 0 ? [users[0].email] : [],
  );
  const [hasSubtask, setHasSubtask] = useState(false);
  const [subtasks, setSubtasks] = useState<Array<{ title: string; status: Task["status"]; priority: Task["priority"] }>>([]);
  const [isSubtask, setIsSubtask] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const assigneeOptions = useMemo(() => users, [users]);

  const toggleAssignee = (email: string) => {
    setSelectedAssignees((current) =>
      current.includes(email) ? current.filter((item) => item !== email) : [...current, email],
    );
  };

  const handleAdd = () => {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (users.length > 0 && selectedAssignees.length === 0) {
      setError("Please assign the task to at least one member.");
      return;
    }

    const taskPayload: Task = {
      id: Math.random().toString(36).slice(2),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      deadline: deadline || minDeadline,
      assigned_to: selectedAssignees.length > 0 ? selectedAssignees : "",
      created_by: users[0]?.email ?? "",
      created_at: new Date().toISOString(),
      parent_task_id: isSubtask && parentTaskId ? parentTaskId : undefined,
      subtasks: hasSubtask && subtasks.length > 0 ? subtasks : undefined,
    };

    onAdd(taskPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fff] rounded-xl shadow-2xl p-8 w-[400px] animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Add Task</h3>
          <button onClick={onClose} className="text-2xl hover:text-[#84934A] transition duration-200">&times;</button>
        </div>
        <div className="grid gap-4">
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
              className="mt-2 h-28 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
              placeholder="Describe the task"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#374151]">
              Due date
              <input
                type="date"
                min={minDeadline}
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
              />
            </label>
            <label className="block text-sm font-medium text-[#374151]">
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Task["priority"])}
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
              onChange={(event) => setStatus(event.target.value as Task["status"])}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <div className="space-y-3 rounded-2xl border border-[#D1D5DB] bg-[#F8FAFB] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#374151]">Assign members</p>
              <span className="text-xs text-[#6B7280]">Select at least one</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {assigneeOptions.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No members available yet.</p>
              ) : (
                assigneeOptions.map((user) => {
                  const isSelected = selectedAssignees.includes(user.email);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleAssignee(user.email)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-[#84934A] bg-[#EAF0E2] text-[#1F4330]"
                          : "border-[#D1D5DB] bg-[#F8FAFC] text-[#374151] hover:bg-[#EFF3EE]"
                      }`}
                    >
                      {user.email}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#374151]">
            <input
              type="checkbox"
              checked={hasSubtask}
              onChange={() => setHasSubtask((current) => !current)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#84934A] focus:ring-[#84934A]"
            />
            Add subtasks
          </label>
          {hasSubtask && <SubtaskForm subtasks={subtasks} setSubtasks={setSubtasks} />}

          <label className="flex items-center gap-2 text-sm text-[#374151]">
            <input
              type="checkbox"
              checked={isSubtask}
              onChange={() => setIsSubtask((current) => !current)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#84934A] focus:ring-[#84934A]"
            />
            Create as subtask
          </label>
          {isSubtask && (
            <select
              value={parentTaskId}
              onChange={(event) => setParentTaskId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
            >
              <option value="">Select parent task</option>
              {tasks
                .filter((task) => !task.parent_task_id)
                .map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
            </select>
          )}

          {error ? (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">{error}</div>
          ) : null}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="flex-1 bg-[#84934A] text-white rounded-lg py-2 hover:bg-[#656D3F] transition duration-200"
            onClick={handleAdd}
          >
            Add
          </button>
          <button
            className="flex-1 bg-gray-200 rounded-lg py-2 hover:bg-gray-300 transition duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}