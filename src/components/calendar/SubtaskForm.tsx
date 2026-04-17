import { Task } from "@/types/calendar";

type Subtask = {
  title: string;
  status: Task["status"];
  priority: Task["priority"];
};

interface Props {
  subtasks: Subtask[];
  setSubtasks: (subs: Subtask[]) => void;
}

export default function SubtaskForm({ subtasks, setSubtasks }: Props) {
  const addSubtask = () => setSubtasks([...subtasks, { title: "", status: "todo", priority: "low" }]);
  const removeSubtask = (idx: number) => setSubtasks(subtasks.filter((_, i) => i !== idx));
  const updateSubtask = (idx: number, field: string, value: string) => {
    const updated = subtasks.map((st, i) =>
      i === idx ? { ...st, [field]: value } : st
    );
    setSubtasks(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Subtasks</span>
        <button
          className="text-[#84934A] hover:text-[#656D3F] transition duration-200"
          onClick={addSubtask}
          type="button"
        >
          + Add
        </button>
      </div>
      {subtasks.map((st, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            className="border rounded-lg px-2 py-1 flex-1"
            placeholder="Title"
            value={st.title || ""}
            onChange={e => updateSubtask(idx, "title", e.target.value)}
          />
          <select
            className="border rounded-lg px-2 py-1"
            value={st.status}
            onChange={e => updateSubtask(idx, "status", e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="border rounded-lg px-2 py-1"
            value={st.priority}
            onChange={e => updateSubtask(idx, "priority", e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            className="text-red-400 hover:text-red-600 transition duration-200"
            onClick={() => removeSubtask(idx)}
            type="button"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}