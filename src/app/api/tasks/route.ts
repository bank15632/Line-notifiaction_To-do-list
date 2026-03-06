import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      name: body.name,
      description: body.description || null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status || "TODO",
      projectId: body.projectId,
      dependsOnTaskId: body.dependsOnTaskId || null,
      dependsOnSubId: body.dependsOnSubId || null,
    },
    include: {
      subTasks: true,
      dependsOnTask: { select: { id: true, name: true } },
      dependsOnSub: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(task, { status: 201 });
}
