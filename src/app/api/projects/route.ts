import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        include: { subTasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = projects.map((p) => {
    const allItems = [
      ...p.tasks.map((t) => t.status),
      ...p.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
    ];
    const todoCount = allItems.filter((s) => s === "TODO").length;
    const doingCount = allItems.filter((s) => s === "DOING").length;
    const doneCount = allItems.filter((s) => s === "DONE").length;
    const total = allItems.length;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      todoCount,
      doingCount,
      doneCount,
      totalTasks: total,
      completionPercent: total === 0 ? 0 : Math.round((doneCount / total) * 100),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description || null,
      category: body.category || "General",
      emoji: body.emoji || "📋",
    },
  });
  return NextResponse.json(project, { status: 201 });
}
