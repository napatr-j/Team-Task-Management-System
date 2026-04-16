import { Task, User } from "@/types/calendar";
import { useState } from "react";
import SubtaskForm from "./SubtaskForm";

interface Props {
  users: User[];
  onClose: () => void;
  onAdd: (task: Task) => void;
  tasks: Task[];
}

export default function AddTaskModal({ users, onClose, onAdd, tasks }: Props) {
  const [form, setForm] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    deadline: "",
    assigned_to: users[0]?.email,
    created_by: users[0]?.email,
    created_at: new Date().toISOString(),
  });
  const [hasSubtask, setHasSubtask] = useState(false);
  const [subtasks, setSubtasks] = useState<Partial<Task>[]>([]);
  const [isSubtask, setIsSubtask] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const id = Math.random().toString(36).slice(2);
    const mainTask: Task = {
      ...(form as Task),
      id,
      parent_task_id: isSubtask ? parentTaskId : undefined,
    };
    onAdd(mainTask);
    // Optionally add subtasks
    subtasks.forEach((st) => {
      onAdd({
        ...(st as Task),
        id: Math.random().toString(36).slice(2),
        parent_task_id: id,
        created_by: form.created_by!,
        assigned_to: st.assigned_to || form.assigned_to!,
        created_at: new Date().toISOString(),
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fff] rounded-xl shadow-2xl p-8 w-[400px] animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Add Task</h3>
          <button onClick={onClose} className="text-2xl hover:text-[#84934A] transition duration-200">&times;</button>
        </div>
        <div className="flex flex-col gap-3">
          <input
            className="border rounded-lg px-2 py-1"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            className="border rounded-lg px-2 py-1"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <select
            className="border rounded-lg px-2 py-1"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="border rounded-lg px-2 py-1"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            className="border rounded-lg px-2 py-1"
            name="deadline"
            type="date"
            value={form.deadline?.slice(0, 10) || ""}
            onChange={handleChange}
          />
          <select
            className="border rounded-lg px-2 py-1"
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
          >
            {users.map((u) => (
              <option key={u.email} value={u.email}>{u.email}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={hasSubtask}
              onChange={() => setHasSubtask((v) => !v)}
            />
            Has Subtask
          </label>
          {hasSubtask && (
            <SubtaskForm subtasks={subtasks} setSubtasks={setSubtasks} users={users} />
          )}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={isSubtask}
              onChange={() => setIsSubtask((v) => !v)}
            />
            Is Subtask
          </label>
          {isSubtask && (
            <select
              className="border rounded-lg px-2 py-1"
              value={parentTaskId}
              onChange={e => setParentTaskId(e.target.value)}
            >
              <option value="">Select Parent Task</option>
              {tasks
                .filter((t) => !t.parent_task_id)
                .map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
            </select>
          )}
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