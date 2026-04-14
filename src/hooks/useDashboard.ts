"use client";

import { useEffect, useState } from "react";
import type { DashboardStats, Group, Task, TimeFilter } from "@/types/dashboard";
import { getDashboardGroups, getDashboardStats, getDashboardTasks } from "@/lib/api/dashboard";

const initialStats: DashboardStats = {
  overdue: 0,
  priority: 0,
  inProgress: 0,
  velocity: 0,
};

export function useDashboard(groupId?: string) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("tomorrow");
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [statsResponse, tasksResponse] = await Promise.all([
          getDashboardStats(groupId),
          getDashboardTasks(activeFilter, groupId),
        ]);

        if (!isMounted) return;

        setStats(statsResponse);
        setTasks(tasksResponse);
      } catch (err) {
        if (!isMounted) return;
        setError((err as Error).message ?? "Unable to load dashboard data.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [activeFilter, groupId]);

  useEffect(() => {
    let isMounted = true;

    async function loadGroups() {
      try {
        const groupsResponse = await getDashboardGroups();
        if (!isMounted) return;
        setGroups(groupsResponse);
      } catch {
        if (!isMounted) return;
      }
    }

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    stats,
    tasks,
    groups,
    isLoading,
    error,
  };
}
