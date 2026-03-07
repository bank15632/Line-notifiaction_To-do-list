import { formatDaysRemaining, formatDate } from "@/lib/utils";

function statusIcon(status: string): string {
  switch (status) {
    case "TODO":
      return "[Todo]";
    case "DOING":
      return "[Doing]";
    case "DONE":
      return "[Done]";
    default:
      return "[ ]";
  }
}

interface ProjectWithTasks {
  project: {
    name: string;
    tasks: {
      id?: string;
      name: string;
      status: string;
      deadline: Date | null;
      dependsOnTask: { id: string; name: string } | null;
      dependsOnSub: { id: string; name: string } | null;
      subTasks: {
        id?: string;
        name: string;
        status: string;
        deadline: Date | null;
        dependsOnTaskId: string | null;
        dependsOnSubId: string | null;
      }[];
    }[];
  };
}

export function buildNotificationMessage(projectLinks: ProjectWithTasks[]): string {
  let message = "== To-Do List Summary ==\n";

  // Build lookup maps for resolving sub-task dependency names
  const taskNameMap = new Map<string, string>();
  const subNameMap = new Map<string, string>();
  for (const pl of projectLinks) {
    for (const task of pl.project.tasks) {
      if (task.id) taskNameMap.set(task.id, task.name);
      for (const sub of task.subTasks) {
        if (sub.id) subNameMap.set(sub.id, sub.name);
      }
    }
  }

  for (const pl of projectLinks) {
    const project = pl.project;
    const allItems = [
      ...project.tasks.map((t) => t.status),
      ...project.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
    ];
    const todoCount = allItems.filter((s) => s === "TODO").length;
    const doingCount = allItems.filter((s) => s === "DOING").length;
    const doneCount = allItems.filter((s) => s === "DONE").length;
    const total = allItems.length;
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    message += `\n--- ${project.name} (${pct}%) ---\n`;
    message += `Todo: ${todoCount} | Doing: ${doingCount} | Done: ${doneCount}\n`;

    for (const task of project.tasks) {
      message += `\n${statusIcon(task.status)} ${task.name}`;
      if (task.deadline) {
        message += `\n   Deadline: ${formatDate(task.deadline)} (${formatDaysRemaining(task.deadline)})`;
      }
      if (task.dependsOnTask) {
        message += `\n   Depends on Task: ${task.dependsOnTask.name}`;
      }
      if (task.dependsOnSub) {
        message += `\n   Depends on Sub-task: ${task.dependsOnSub.name}`;
      }

      for (const sub of task.subTasks) {
        message += `\n   ${statusIcon(sub.status)} ${sub.name}`;
        if (sub.deadline) {
          message += `\n      Deadline: ${formatDate(sub.deadline)} (${formatDaysRemaining(sub.deadline)})`;
        }
        if (sub.dependsOnTaskId) {
          const taskName = taskNameMap.get(sub.dependsOnTaskId) || sub.dependsOnTaskId;
          message += `\n      Depends on Task: ${taskName}`;
        }
        if (sub.dependsOnSubId) {
          const subName = subNameMap.get(sub.dependsOnSubId) || sub.dependsOnSubId;
          message += `\n      Depends on Sub-task: ${subName}`;
        }
      }
    }
    message += "\n";
  }

  return message;
}
