"use client";
import { useEffect, useState } from "react";

const taskColumns = [
  {
    title: "To Do",
    accent: "bg-[#F4F3E9] text-[#8B7C48]",
    tasks: [
      {
        title: "Create onboarding workflow",
        assignee: "AL",
        priority: "High",
        due: "Apr 22",
      },
      {
        title: "Sync sprint goals",
        assignee: "MS",
        priority: "Medium",
        due: "Apr 23",
      },
      {
        title: "Review API contract",
        assignee: "TR",
        priority: "Low",
        due: "Apr 24",
      },
    ],
  },
  {
    title: "In Progress",
    accent: "bg-[#EAF0E2] text-[#5F6B43]",
    tasks: [
      {
        title: "Design task approval flow",
        assignee: "JT",
        priority: "High",
        due: "Apr 21",
      },
      {
        title: "Set milestone statuses",
        assignee: "NL",
        priority: "Medium",
        due: "Apr 22",
      },
      {
        title: "Copy review for release note",
        assignee: "AS",
        priority: "Low",
        due: "Apr 25",
      },
    ],
  },
  {
    title: "Done",
    accent: "bg-[#F8E9E9] text-[#8E4E4E]",
    tasks: [
      {
        title: "Invite stakeholders",
        assignee: "KP",
        priority: "Low",
        due: "Apr 20",
      },
      {
        title: "Finalize meeting agenda",
        assignee: "EP",
        priority: "Low",
        due: "Apr 20",
      },
    ],
  },
];

const calendarColumns = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarDays = Array.from({ length: 35 }, (_, idx) => (idx < 31 ? idx + 1 : null));
const calendarEvents = new Map<number, string>([
  [4, "Sprint review • JT"],
  [10, "Release planning • NL"],
  [15, "Client sync • AS"],
  [23, "Design session • KP"],
]);

const checklistItems = [
  {
    title: "Publish sprint summary",
    assignee: "SP",
    status: "In review",
    date: "Apr 21",
    done: true,
  },
  {
    title: "Add new client requests",
    assignee: "EA",
    status: "Pending",
    date: "Apr 22",
    done: false,
  },
  {
    title: "Prepare launch assets",
    assignee: "MR",
    status: "In progress",
    date: "Apr 25",
    done: false,
  },
  {
    title: "Confirm release demo",
    assignee: "GB",
    status: "Scheduled",
    date: "Apr 26",
    done: false,
  },
  {
  title: "Prepare sprint retrospective",
  assignee: "LK",
  status: "In progress",
  date: "Apr 27",
  done: false,
  },
  {
  title: "Update API documentation",
  assignee: "NT",
  status: "Pending",
  date: "Apr 28",
  done: false,
  },
  {
  title: "User feedback review",
  assignee: "CW",
  status: "Scheduled",
  date: "Apr 29",
  done: false,
  },
];

const views = [
  {
    title: "Task Board",
    description: "Kanban board with columns, priorities, and due dates for every team task.",
  },
  {
    title: "Calendar View",
    description: "Monthly planning with color-coded events, deadlines, and today's highlights.",
  },
  {
    title: "Task List",
    description: "Checklist view combining status, assignees, and due dates in one clean feed.",
  },
];

function taskPriorityClass(priority: string) {
  if (priority === "High") return "bg-[#E76E6E]/15 text-[#8B2727]";
  if (priority === "Medium") return "bg-[#F1E9BD]/80 text-[#766F38]";
  return "bg-[#DCE8D8]/80 text-[#506446]";
}

function statusClass(status: string) {
  if (status === "In review") return "bg-[#FDE8D9] text-[#9C4E2F]";
  if (status === "In progress") return "bg-[#E8F2E8] text-[#3F6C42]";
  if (status === "Scheduled") return "bg-[#E9EBF8] text-[#3E4A7F]";
  return "bg-[#F5F5F5] text-[#575757]";
}

export default function DemoMockup() {
  const [activeView, setActiveView] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveView((current) => (current + 1) % views.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="rounded-[28px] border border-white/50 bg-white/90 p-5 shadow-[0_30px_70px_rgba(17,24,39,0.08)] backdrop-blur-xl lg:min-w-[700px] lg:p-6 xl:min-w-[760px]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="flex flex-col gap-4 rounded-[24px] border border-[#ECECEC] bg-[#F9F8F4]/80 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#656D3F]">Live Product Preview</p>
            <p className="mt-2 text-sm text-[#555]">Switches between board, calendar, and task list automatically.</p>
          </div>
          <div className="rounded-full bg-[#ECECEC] px-3 py-1 text-sm font-medium text-[#656D3F] shadow-inner">TeamSync</div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[#ECECEC] bg-[#1A1A1A]/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="absolute -top-8 right-6 h-24 w-24 rounded-full bg-[#84934A]/15 blur-3xl" />
          <div className="space-y-3 text-sm text-[#555]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#84934A]" />
              <span className="font-medium text-[#1A1A1A]">{views[activeView].title}</span>
            </div>
            <p>{views[activeView].description}</p>
          </div>

          <div className="relative mt-5 min-h-[400px] overflow-hidden rounded-[20px] bg-[#FFFFFF] p-4 shadow-[0_18px_42px_rgba(17,24,39,0.08)] sm:p-6 lg:min-h-[460px]">
            <div className={`transition-opacity duration-700 ease-in-out ${activeView === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <div className="grid gap-4 lg:grid-cols-3">
                {taskColumns.map((column) => (
                  <div key={column.title} className="space-y-4 rounded-[20px] border border-[#ECECEC] bg-[#F9F9F5] p-4 shadow-sm">
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${column.accent}`}>{column.title}</div>
                    <div className="space-y-4">
                      {column.tasks.map((task) => (
                        <div key={task.title} className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="min-w-0 flex-1 text-sm font-semibold text-[#1A1A1A]">
                              {task.title}
                            </h4>

                            <span
                              className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${taskPriorityClass(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-4 text-[13px] text-[#6A6A6A]">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ECECEC] text-sm font-semibold text-[#492828]">{task.assignee}</span>
                            <span>{task.due}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeView === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
              <div className="grid gap-3 rounded-[24px] bg-[#F8F7F2] p-5 sm:p-6">
                <div className="grid grid-cols-7 gap-2 text-[11px] uppercase tracking-[0.22em] text-[#6B6B6B]">
                  {calendarColumns.map((day) => (
                    <div key={day} className="text-center">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => {
                    const isToday = day === 18;
                    const eventLabel = day ? calendarEvents.get(day) : undefined;
                    return (
                      <div key={idx} className={`min-h-[84px] overflow-hidden rounded-3xl border border-[#E9E7DC] bg-white p-2 text-[12px] ${isToday ? "border-[#84934A] bg-[#E4F0D8]" : ""}`}>
                        <div className="flex items-start justify-between gap-2 text-[#5E5E5E]">
                          <span className={
                            isToday
                              ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#84934A] text-white font-semibold"
                              : ""
                          }>{day ?? ""}</span>
                        </div>
                        {eventLabel ? (
                          <div className="mt-3 space-y-2">
                            <div className="rounded-2xl bg-[#E8F2E9] px-2 py-1 text-[10px] font-semibold text-[#3F6C42]">
                              {eventLabel}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeView === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
              <div className="space-y-3 rounded-[24px] bg-[#F8F7F2] p-5 sm:p-6">
                {checklistItems.map((item) => (
                  <div key={item.title} className="grid gap-3 rounded-3xl bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${item.done ? "border-[#84934A] bg-[#E8F2E8] text-[#3F6C42]" : "border-[#D9D9D9] text-[#9A9A9A]"}`}>
                        {item.done ? "✓" : ""}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${item.done ? "text-[#494949] line-through" : "text-[#1A1A1A]"}`}>{item.title}</p>
                        <p className="text-[12px] text-[#7A7A7A]">{item.assignee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#6C6C6C]">
                      <span className={`rounded-full px-2 py-1 ${statusClass(item.status)}`}>{item.status}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {views.map((view, index) => (
            <button
              key={view.title}
              type="button"
              aria-label={`Show ${view.title}`}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeView === index ? "bg-[#84934A] shadow-[0_0_0_8px_rgba(132,147,74,0.12)]" : "bg-[#D9D9D9] hover:bg-[#84934A]/60"}`}
              onClick={() => setActiveView(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
