import { formatDaysRemaining, formatDate } from "@/lib/utils";

function statusEmoji(status: string): string {
  switch (status) {
    case "TODO":
      return "\u26AA\uFE0F";
    case "DOING":
      return "\u{1F534}";
    case "CHECKING":
      return "\u{1F7E1}";
    case "DONE":
      return "\u{1F7E2}";
    default:
      return "\u26AA\uFE0F";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "TODO":
      return "Todo";
    case "DOING":
      return "Doing";
    case "CHECKING":
      return "Checking";
    case "DONE":
      return "Done";
    default:
      return status;
  }
}

function deadlineText(deadline: Date | null): string {
  if (!deadline) return "";
  return ` (\u23F3 ${formatDate(deadline)} / ${formatDaysRemaining(deadline)})`;
}

function doneText(status: string): string {
  if (status === "DONE") return " (\u{1F389} Done!)";
  return "";
}

function dependencyText(depName: string | null | undefined): string {
  if (!depName) return "";
  return ` (wait: ${depName})`;
}

interface ProjectWithTasks {
  project: {
    name: string;
    emoji?: string;
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

  let message = "\u{1F4CB} To-Do List Summary \u{1F4CB}\n";

  for (let i = 0; i < projectLinks.length; i++) {
    const pl = projectLinks[i];
    const project = pl.project;
    const projectEmoji = project.emoji || "\u{1F4CB}";

    const allItems = [
      ...project.tasks.map((t) => t.status),
      ...project.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
    ];
    const doneCount = allItems.filter((s) => s === "DONE").length;
    const total = allItems.length;
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    message += `\n${projectEmoji} ${i + 1}. ${project.name} (${pct}%)`;

    for (const task of project.tasks) {
      const taskStatus = task.status === "DONE"
        ? doneText(task.status)
        : deadlineText(task.deadline);
      const taskDep = task.dependsOnTask
        ? dependencyText(task.dependsOnTask.name)
        : task.dependsOnSub
          ? dependencyText(task.dependsOnSub.name)
          : "";

      message += `\n\n       \u25B6\uFE0F [${statusLabel(task.status)}] ${task.name}${taskStatus}${taskDep}`;

      for (const sub of task.subTasks) {
        const subStatus = sub.status === "DONE"
          ? doneText(sub.status)
          : sub.status === "CHECKING"
            ? " (checking)"
            : sub.status === "DOING"
              ? deadlineText(sub.deadline) || " (started)"
              : deadlineText(sub.deadline);

        let subDep = "";
        if (sub.dependsOnSubId) {
          const depName = subNameMap.get(sub.dependsOnSubId) || sub.dependsOnSubId;
          subDep = dependencyText(depName);
        } else if (sub.dependsOnTaskId) {
          const depName = taskNameMap.get(sub.dependsOnTaskId) || sub.dependsOnTaskId;
          subDep = dependencyText(depName);
        }

        message += `\n               ${statusEmoji(sub.status)} [${statusLabel(sub.status)}] ${sub.name}${subStatus}${subDep}`;
      }
    }

    if (i < projectLinks.length - 1) {
      message += "\n---------------------------------------------------------------------------------------------------------\n";
    }
  }

  return message;
}
