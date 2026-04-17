import { Task, CalendarEvent } from "@/types/calendar";

interface Props {
  month: number;
  year: number;
  selectedDate: Date | null;
  tasks: Task[];
  events: CalendarEvent[];
  onTaskClick: (task: Task) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const formatTaskAssignees = (task: Task) => {
  const emails = Array.isArray(task.assigned_to)
    ? task.assigned_to
    : task.assigned_to
    ? [task.assigned_to]
    : [];

  if (emails.length > 0) {
    return emails.slice(0, 2).join(", ") + (emails.length > 2 ? ` +${emails.length - 2} more` : "");
  }

  if (Array.isArray(task.assignees) && task.assignees.length > 0) {
    const labels = task.assignees.map((assignee) => assignee.initials ?? assignee.id.slice(0, 2).toUpperCase());
    return labels.slice(0, 2).join(", ") + (labels.length > 2 ? ` +${labels.length - 2} more` : "");
  }

  return "Unassigned";
};

export default function MonthTaskDetails({ month, year, selectedDate, tasks, events, onTaskClick, onEventClick }: Props) {
  const monthlyTasks = tasks.filter((task) => {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    return (
      deadline &&
      deadline.getMonth() === month &&
      deadline.getFullYear() === year
    );
  });

  const monthlyEvents = events.filter((event) => {
    const start = event.start_time ? new Date(event.start_time) : null;
    return (
      start &&
      start.getMonth() === month &&
      start.getFullYear() === year
    );
  });

  const selectedTasks = selectedDate
    ? monthlyTasks.filter(
        (task) => new Date(task.deadline).toDateString() === selectedDate.toDateString(),
      )
    : [];

  const selectedEvents = selectedDate
    ? monthlyEvents.filter(
        (event) => new Date(event.start_time).toDateString() === selectedDate.toDateString(),
      )
    : [];

  const completedCount = monthlyTasks.filter((task) => task.status === "done").length;
  const pendingCount = monthlyTasks.filter((task) => task.status !== "done").length;

  return (
    <div className="bg-[#fff] rounded-xl shadow p-6 mt-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Month overview</p>
          <h4 className="text-lg font-semibold text-[#1A1A1A]">
            {new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" })}
          </h4>
        </div>
        <div className="text-sm text-[#4B5563]">
          <div>{monthlyTasks.length} task{monthlyTasks.length === 1 ? "" : "s"}</div>
          <div>{monthlyEvents.length} event{monthlyEvents.length === 1 ? "" : "s"}</div>
          <div>{completedCount} completed</div>
          <div>{pendingCount} pending</div>
        </div>
      </div>

      {selectedDate ? (
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#111827]">Agenda for {selectedDate.toLocaleDateString()}</p>
          <p className="text-sm text-[#6B7280]">{selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"}, {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}</p>
        </div>
      ) : (
        <div className="mb-4 text-sm text-[#6B7280]">Click a day to preview its tasks and events.</div>
      )}

      <div className="space-y-4">
        {(selectedDate ? selectedTasks : monthlyTasks).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F8FAFB] p-4 text-sm text-[#6B7280]">
            {selectedDate ? "No tasks for this day." : "No tasks for this month."}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[#111827]">{selectedDate ? "Tasks" : "Monthly Tasks"}</div>
            {(selectedDate ? selectedTasks : monthlyTasks).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onTaskClick(task)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-left transition hover:bg-[#ECECEC]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#111827]">{task.title}</span>
                  <span className="text-xs text-[#6B7280]">{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-[#525252] line-clamp-2">{task.description || "No description."}</p>
                <div
                  className="mt-3 text-xs text-[#6B7280]"
                  title={Array.isArray(task.assignees) && task.assignees.length > 0 ? task.assignees.map((assignee) => assignee.email ?? assignee.id).join(", ") : undefined}
                >
                  Assigned to: {formatTaskAssignees(task)}
                </div>
              </button>
            ))}
          </div>
        )}

        {(selectedDate ? selectedEvents : monthlyEvents).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F8FAFB] p-4 text-sm text-[#6B7280]">
            {selectedDate ? "No events for this day." : "No events for this month."}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[#111827]">{selectedDate ? "Events" : "Monthly Events"}</div>
            {(selectedDate ? selectedEvents : monthlyEvents).map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick(event)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-left transition hover:bg-[#ECECEC]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#111827]">{event.title}</span>
                  <span className="text-xs text-[#6B7280]">{new Date(event.start_time).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-[#525252] line-clamp-2">{event.description || "No description."}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
