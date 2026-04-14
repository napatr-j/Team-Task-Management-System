export type TimeFilter = "tomorrow" | "next_week" | "later" | "overdue" | "in_progress";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  badge: "urgent" | "drafting" | "meeting" | "review";
  assignees: { id: string; avatarUrl?: string; initials?: string }[];
  completed: boolean;
}

export interface OverdueTask extends Task {
  groupName: string;
  status: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface DashboardStats {
  overdue: number;
  priority: number;
  inProgress: number;
  velocity: number;
}

export interface FocusArea {
  id: string;
  label: string;
  color: "olive" | "contrast" | "oliveDark";
  taskCount: number;
}
