import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { archived: false },
    include: {
      tasks: {
        include: { subTasks: true },
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
    parentTaskName?: string;
  }[] = [];

  for (const p of projects) {
    for (const t of p.tasks) {
      if (t.deadline) {
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
        });
      }
      for (const s of t.subTasks) {
        if (s.deadline) {
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
