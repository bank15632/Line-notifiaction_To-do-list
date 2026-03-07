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
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const body = await req.json();
  // Build data object only with provided fields to support partial updates
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
  if (body.status !== undefined) data.status = body.status;
  if ("dependsOnTaskId" in body) data.dependsOnTaskId = body.dependsOnTaskId || null;
  if ("dependsOnSubId" in body) data.dependsOnSubId = body.dependsOnSubId || null;

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
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
