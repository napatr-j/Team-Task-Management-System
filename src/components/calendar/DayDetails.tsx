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
    (t) => new Date(t.deadline).toDateString() === date.toDateString()
  );
  return (
    <div className="bg-[#fff] rounded-xl shadow p-4 mt-4">
      <h4 className="font-semibold text-[#84934A] mb-2">
        Agenda for {date.toLocaleDateString()}
      </h4>
      <div className="flex flex-col gap-2">
        {dayTasks.length === 0 && (
          <span className="text-gray-400">No tasks for this day.</span>
        )}
        {dayTasks.map((task) => {
          const user = users.find((u) => u.email === task.assigned_to);
          return (
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
              <div className="text-xs text-gray-500">
                Assigned to: {user?.email}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}