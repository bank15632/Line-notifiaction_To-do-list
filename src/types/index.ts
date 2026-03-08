import { Status } from "@prisma/client";

export type { Status };

export interface ProjectWithStats {
  id: string;
  name: string;
  description: string | null;
  category: string;
  emoji: string;
  todoCount: number;
  doingCount: number;
  checkingCount: number;
  doneCount: number;
  totalTasks: number;
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithDetails {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: Status;
  projectId: string;
  dependsOnTaskId: string | null;
  dependsOnSubId: string | null;
  dependsOnTask?: { id: string; name: string } | null;
  dependsOnSub?: { id: string; name: string } | null;
  subTasks: SubTaskWithDetails[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTaskWithDetails {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: Status;
  taskId: string;
  dependsOnTaskId: string | null;
  dependsOnSubId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LineGroupWithProjects {
  id: string;
  groupId: string;
  name: string;
  notifyFrequency: number;
  notifyTime: string;
  lastNotifiedAt: string | null;
  projects: {
    id: string;
    projectId: string;
    project: { id: string; name: string };
  }[];
}
