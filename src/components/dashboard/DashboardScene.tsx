"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import StatsRow from "@/components/dashboard/StatsRow";
import TaskList from "@/components/dashboard/TaskList";
import TaskCompletionCadence from "@/components/dashboard/TaskCompletionCadence";
import VelocityCard from "@/components/dashboard/VelocityCard";
import { useDashboard } from "@/hooks/useDashboard";
import { getDashboardTasks } from "@/lib/api/dashboard";
import type { Task, TimeFilter } from "@/types/dashboard";

const filterTitleMap: Record<TimeFilter, { title: string; subtitle: string }> = {
  overdue: { title: "Overdue tasks", subtitle: "Tasks that passed the deadline." },
  tomorrow: { title: "Due in 24h", subtitle: "Tasks due in the next 24 hours." },
  next_week: { title: "Upcoming next week", subtitle: "Tasks due in the coming week." },
  later: { title: "Later tasks", subtitle: "Tasks due after next week." },
  in_progress: { title: "In progress tasks", subtitle: "Tasks that are still active and not overdue." },
};

export default function DashboardScene() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("group") ?? undefined;
  const { activeFilter, setActiveFilter, stats, tasks, groups, isLoading, error } = useDashboard(groupId);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState<TimeFilter | null>(null);
  const [modalTasks, setModalTasks] = useState<Task[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const selectedGroup = groups.find((group) => group.id === groupId);

  useEffect(() => {
    setModalTasks([]);
    setShowTaskModal(false);
    setModalMode(null);
  }, [groupId]);

  const openTaskModal = async (mode: TimeFilter) => {
    setModalMode(mode);
    setShowTaskModal(true);
    setIsModalLoading(true);

    try {
      const results = await getDashboardTasks(mode, groupId);
      setModalTasks(results);
    } catch {
      setModalTasks([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setModalMode(null);
    setModalTasks([]);
  };

  const activeTitle = modalMode ? filterTitleMap[modalMode].title : "";
  const activeSubtitle = modalMode ? filterTitleMap[modalMode].subtitle : "";

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] bg-team-surface p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-team-olive/90">Sprint Workspace</p>
            <h2 className="mt-2 text-3xl font-semibold text-team-text">Critical team health</h2>
            <p className="mt-2 max-w-2xl text-sm text-team-text/70">
              {selectedGroup
                ? `Group view for ${selectedGroup.name}.`
                : "All work across your active groups displayed in a calendar-inspired view."}
            </p>
          </div>
        </div>
      </div>

      <StatsRow
        stats={stats}
        onAddTask={() => setShowNewTaskModal(true)}
        onOverdueClick={() => openTaskModal("overdue")}
        onDueClick={() => openTaskModal("tomorrow")}
        onProgressClick={() => openTaskModal("in_progress")}
      />

      <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr] xl:items-stretch">
        <div className="space-y-6">
          <TaskList tasks={tasks} />
          {isLoading && (
            <div className="rounded-3xl bg-team-surface p-6 text-sm text-team-text/70 shadow-soft">
              Loading dashboard content...
            </div>
          )}
          {error && (
            <div className="rounded-3xl bg-[#FFF4F4] p-6 text-sm text-contrast shadow-soft">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <VelocityCard percent={stats.velocity} />
        </div>
      </div>

      <TaskCompletionCadence tasks={tasks} />

      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[1.5rem] bg-team-surface p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-team-text">New task coming soon</h3>
            <p className="mt-4 text-sm leading-6 text-team-text/70">
              This feature is not ready yet. We are working on a minimal task creation flow so you can plan work directly from the dashboard soon.
            </p>
            <button
              type="button"
              onClick={() => setShowNewTaskModal(false)}
              className="mt-6 inline-flex rounded-lg bg-team-olive px-4 py-2 text-sm font-semibold text-team-surface transition-all duration-200 hover:bg-team-oliveDark"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showTaskModal && modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-20">
          <div className="w-full max-w-3xl rounded-[1.5rem] bg-team-surface p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-team-text">{activeTitle}</h3>
                <p className="text-sm text-team-text/70">{activeSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeTaskModal}
                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm text-team-text transition-all duration-200 hover:bg-team-bg"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {isModalLoading ? (
                <div className="rounded-3xl bg-team-bg p-6 text-sm text-team-text/70">Loading tasks...</div>
              ) : modalTasks.length === 0 ? (
                <div className="rounded-3xl bg-team-bg p-6 text-sm text-team-text/70">No tasks found for this segment.</div>
              ) : (
                modalTasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-[#E5E7EB] bg-team-bg p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-team-text">{task.title}</h4>
                        <p className="text-sm text-team-text/70 line-clamp-2">{task.description}</p>
                      </div>
                      <div className="space-y-1 text-right text-sm text-team-text/70">
                        <p>Due {new Date(task.dueDate).toLocaleString()}</p>
                        <p>{task.completed ? "Completed" : "Open"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
