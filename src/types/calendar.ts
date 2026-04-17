export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  assigned_to?: string | string[];
  assignees?: Array<{ id: string; avatarUrl?: string; initials?: string; email?: string }>;
  created_by: string;
  created_at: string;
  parent_task_id?: string;
  team_id?: string;
  subtasks?: Array<{ title: string; status: TaskStatus }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  team_id?: string;
  participants?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "member";
}
