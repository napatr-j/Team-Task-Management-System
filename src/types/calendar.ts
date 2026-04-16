export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  parent_task_id?: string;
  team_id?: string;
}

export interface User {
  email: string;
  name: string;
  role: "owner" | "manager" | "member";
}
