import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushTextMessage } from "@/lib/line";
import { formatDaysRemaining, formatDate } from "@/lib/utils";

function shouldNotify(
  frequency: string,
  lastNotifiedAt: Date | null
): boolean {
  if (!lastNotifiedAt) return true;

  const now = new Date();
  const diffMs = now.getTime() - lastNotifiedAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (frequency) {
    case "DAILY":
      return diffDays >= 1;
    case "EVERY_3_DAYS":
      return diffDays >= 3;
    case "WEEKLY":
      return diffDays >= 7;
    default:
      return diffDays >= 1;
  }
}

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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.lineGroup.findMany({
    include: {
      projects: {
        include: {
          project: {
            include: {
              tasks: {
                include: {
                  subTasks: true,
                  dependsOnTask: { select: { id: true, name: true } },
                  dependsOnSub: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  let notifiedCount = 0;

  for (const group of groups) {
    if (!shouldNotify(group.notifyFrequency, group.lastNotifiedAt)) {
      continue;
    }

    if (group.projects.length === 0) continue;

    let message = "== To-Do List Summary ==\n";

    for (const pl of group.projects) {
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
            message += `\n      Depends on Task ID: ${sub.dependsOnTaskId}`;
          }
          if (sub.dependsOnSubId) {
            message += `\n      Depends on Sub-task ID: ${sub.dependsOnSubId}`;
          }
        }
      }
      message += "\n";
    }

    try {
      await pushTextMessage(group.groupId, message);
      await prisma.lineGroup.update({
        where: { id: group.id },
        data: { lastNotifiedAt: new Date() },
      });
      notifiedCount++;
    } catch (err) {
      console.error(`Failed to notify group ${group.name}:`, err);
    }
  }

  return NextResponse.json({ success: true, notifiedCount });
}
