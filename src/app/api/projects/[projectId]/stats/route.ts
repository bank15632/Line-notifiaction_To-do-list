import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: { include: { subTasks: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "ไม่พบโปรเจค" }, { status: 404 });
  }

  const allItems = [
    ...project.tasks.map((t) => t.status),
    ...project.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
  ];

  const todoCount = allItems.filter((s) => s === "TODO").length;
  const doingCount = allItems.filter((s) => s === "DOING").length;
  const doneCount = allItems.filter((s) => s === "DONE").length;
  const total = allItems.length;

  return NextResponse.json({
    todoCount,
    doingCount,
    doneCount,
    total,
    completionPercent: total === 0 ? 0 : Math.round((doneCount / total) * 100),
  });
}
