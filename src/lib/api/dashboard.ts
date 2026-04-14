import type { DashboardStats, Group, OverdueTask, Task, TimeFilter } from "@/types/dashboard";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json();
}

export async function getDashboardStats(groupId?: string): Promise<DashboardStats> {
  const params = groupId ? `?group=${groupId}` : "";
  return fetchJson<DashboardStats>(`/api/dashboard/stats${params}`);
}

export async function getDashboardTasks(filter: TimeFilter, groupId?: string): Promise<Task[]> {
  const queryParams = [`filter=${filter}`, groupId ? `group=${groupId}` : ""].filter(Boolean).join("&");
  return fetchJson<Task[]>(`/api/dashboard/tasks?${queryParams}`);
}

export async function getDashboardGroups(): Promise<Group[]> {
  return fetchJson<Group[]>("/api/dashboard/groups");
}

export async function getDashboardOverdueTasks(groupId?: string): Promise<OverdueTask[]> {
  const params = groupId ? `?group=${groupId}` : "";
  return fetchJson<OverdueTask[]>(`/api/dashboard/overdue-tasks${params}`);
}
