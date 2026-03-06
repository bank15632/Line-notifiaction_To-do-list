import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;
  const body = await req.json();
  const subtask = await prisma.subTask.update({
    where: { id: subtaskId },
    data: {
      name: body.name,
      description: body.description,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status,
      dependsOnTaskId: body.dependsOnTaskId ?? null,
      dependsOnSubId: body.dependsOnSubId ?? null,
    },
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
