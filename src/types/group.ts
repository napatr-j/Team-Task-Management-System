export type GroupMemberRole = "Admin" | "Manager" | "Member";

export type Member = {
  id: string;
  email: string;
  fullName?: string;
  role: GroupMemberRole;
  avatarInitials: string;
};

export type Group = {
  id: string;
  name: string;
  mission: string;
  memberCount: number;
  members: Member[];
  activeProject?: string;
  createdAt: string;
  createdBy?: string;
  currentUserRole?: GroupMemberRole;
  currentUserId?: string;
  canManageMembers?: boolean;
  canDelete?: boolean;
};
