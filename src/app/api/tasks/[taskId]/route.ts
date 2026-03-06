import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      subTasks: true,
      dependsOnTask: { select: { id: true, name: true } },
      dependsOnSub: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "ไม่พบ Task" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const body = await req.json();
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      name: body.name,
      description: body.description,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status,
      dependsOnTaskId: body.dependsOnTaskId ?? null,
      dependsOnSubId: body.dependsOnSubId ?? null,
    },
    include: {
      subTasks: true,
      dependsOnTask: { select: { id: true, name: true } },
      dependsOnSub: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
