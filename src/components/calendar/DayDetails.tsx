import { Task, User } from "@/types/calendar";

interface Props {
  date: Date | null;
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
}

export default function DayDetails({ date, tasks, users, onTaskClick }: Props) {
  if (!date) return null;
  const dayTasks = tasks.filter(
    (t) => new Date(t.deadline).toDateString() === date.toDateString(),
  );

  const formatAssignees = (task: Task) => {
    const emails = Array.isArray(task.assigned_to)
      ? task.assigned_to
      : task.assigned_to
      ? [task.assigned_to]
      : [];

    if (emails.length > 0) {
      return emails
        .map((email) => users.find((u) => u.email === email)?.email ?? email)
        .join(", ");
    }

    if (Array.isArray(task.assignees) && task.assignees.length > 0) {
      const entries = task.assignees.map((assignee) => {
        const user = users.find((u) => u.id === assignee.id);
        return user?.email ?? assignee.initials ?? assignee.id;
      });
      const firstTwo = entries.slice(0, 2);
      return firstTwo.join(", ") + (entries.length > 2 ? ` +${entries.length - 2} more` : "");
    }

    return "Unassigned";
  };

  return (
    <div className="bg-[#fff] rounded-xl shadow p-4 mt-4">
      <h4 className="font-semibold text-[#84934A] mb-2">
        Agenda for {date.toLocaleDateString()}
      </h4>
      <div className="flex flex-col gap-2">
        {dayTasks.length === 0 && (
          <span className="text-gray-400">No tasks for this day.</span>
        )}
        {dayTasks.map((task) => (
          <div
            key={task.id}
            className="p-2 rounded-lg hover:bg-[#ECECEC] cursor-pointer transition duration-200"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{task.title}</span>
              <span className="text-xs text-gray-400">{task.status}</span>
            </div>
            <div className="text-sm text-gray-600">{task.description}</div>
            <div
              className="text-xs text-gray-500"
              title={Array.isArray(task.assignees) && task.assignees.length > 0 ? task.assignees.map((assignee) => assignee.email ?? assignee.id).join(", ") : undefined}
            >
              Assigned to: {formatAssignees(task)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}