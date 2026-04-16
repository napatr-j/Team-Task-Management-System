import { Task, User } from "@/types/calendar";
import { useState } from "react";

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "inprogress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface Props {
  task: Task;
  users: User[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export default function TaskModal({ task, users, onClose, onUpdate }: Props) {
  const user = users.find((u) => u.email === task.assigned_to);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(task);

  // Assume current user is owner/manager for demo
  const canEdit = true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate(form);
    setEdit(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fff] rounded-xl shadow-2xl p-8 w-[400px] animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Task Details</h3>
          <button onClick={onClose} className="text-2xl hover:text-[#84934A] transition duration-200">&times;</button>
        </div>
        <div className="flex flex-col gap-3">
          {edit ? (
            <>
              <input
                className="border rounded-lg px-2 py-1"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
              <textarea
                className="border rounded-lg px-2 py-1"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
              <select
                className="border rounded-lg px-2 py-1"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                className="border rounded-lg px-2 py-1"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
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
              <input
                className="border rounded-lg px-2 py-1"
                name="deadline"
                type="date"
                value={form.deadline.slice(0, 10)}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
              />
            </>
          ) : (
            <>
              <div>
                <span className="font-semibold">Title:</span> {task.title}
              </div>
              <div>
                <span className="font-semibold">Description:</span> {task.description}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {task.status}
              </div>
              <div>
                <span className="font-semibold">Priority:</span> {task.priority}
              </div>
              <div>
                <span className="font-semibold">Assigned to:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold">Created at:</span> {task.created_at.slice(0, 10)}
              </div>
              <div>
                <span className="font-semibold">Deadline:</span> {task.deadline.slice(0, 10)}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          {canEdit && !edit && (
            <button
              className="flex-1 bg-[#84934A] text-white rounded-lg py-2 hover:bg-[#656D3F] transition duration-200"
              onClick={() => setEdit(true)}
            >
              Edit
            </button>
          )}
          {edit && (
            <button
              className="flex-1 bg-[#84934A] text-white rounded-lg py-2 hover:bg-[#656D3F] transition duration-200"
              onClick={handleSave}
            >
              Update
            </button>
          )}
          <button
            className="flex-1 bg-gray-200 rounded-lg py-2 hover:bg-gray-300 transition duration-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}