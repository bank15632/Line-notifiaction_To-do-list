import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;
  const subtask = await prisma.subTask.findUnique({
    where: { id: subtaskId },
    include: {
      task: { select: { id: true, name: true, projectId: true } },
    },
  });
  if (!subtask) {
    return NextResponse.json({ error: "Sub-task not found" }, { status: 404 });
  }
  return NextResponse.json(subtask);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;
  const body = await req.json();
  // Build data object only with provided fields to support partial updates
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
  if (body.status !== undefined) data.status = body.status;
  if ("dependsOnTaskId" in body) data.dependsOnTaskId = body.dependsOnTaskId || null;
  if ("dependsOnSubId" in body) data.dependsOnSubId = body.dependsOnSubId || null;

  const subtask = await prisma.subTask.update({
    where: { id: subtaskId },
    data,
  });
  return NextResponse.json(subtask);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;
  await prisma.subTask.delete({ where: { id: subtaskId } });
  return NextResponse.json({ success: true });
}
