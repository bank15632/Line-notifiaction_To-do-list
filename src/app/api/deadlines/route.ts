import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { archived: false },
    include: {
      tasks: {
        include: {
          subTasks: true,
          dependsOnTask: { select: { id: true, name: true } },
          dependsOnSub: { select: { id: true, name: true } },
        },
      },
    },
  });

  const items: {
    id: string;
    name: string;
    type: "task" | "subtask";
    status: string;
    deadline: string;
    projectName: string;
    projectId: string;
    category: string;
    emoji: string;
    dependsOn?: string;
    parentTaskName?: string;
  }[] = [];

  // Build lookup maps for resolving dependency names
  const taskNameMap = new Map<string, string>();
  const subNameMap = new Map<string, string>();
  for (const p of projects) {
    for (const t of p.tasks) {
      taskNameMap.set(t.id, t.name);
      for (const s of t.subTasks) {
        subNameMap.set(s.id, s.name);
      }
    }
  }

  for (const p of projects) {
    for (const t of p.tasks) {
      if (t.deadline) {
        const depName = t.dependsOnTask?.name || t.dependsOnSub?.name || undefined;
        items.push({
          id: t.id,
          name: t.name,
          type: "task",
          status: t.status,
          deadline: t.deadline.toISOString(),
          projectName: p.name,
          projectId: p.id,
          category: p.category,
          emoji: p.emoji,
          dependsOn: depName,
        });
      }
      for (const s of t.subTasks) {
        if (s.deadline) {
          const depName = s.dependsOnSubId
            ? subNameMap.get(s.dependsOnSubId)
            : s.dependsOnTaskId
              ? taskNameMap.get(s.dependsOnTaskId)
              : undefined;
          items.push({
            id: s.id,
            name: s.name,
            type: "subtask",
            status: s.status,
            deadline: s.deadline.toISOString(),
            projectName: p.name,
            projectId: p.id,
            category: p.category,
            emoji: p.emoji,
            dependsOn: depName,
            parentTaskName: t.name,
          });
        }
      }
    }
  }

  // Sort by deadline ascending
  items.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return NextResponse.json(items);
}
