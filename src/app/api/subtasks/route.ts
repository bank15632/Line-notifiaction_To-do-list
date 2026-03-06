import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const subtask = await prisma.subTask.create({
    data: {
      name: body.name,
      description: body.description || null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status || "TODO",
      taskId: body.taskId,
      dependsOnTaskId: body.dependsOnTaskId || null,
      dependsOnSubId: body.dependsOnSubId || null,
    },
  });
  return NextResponse.json(subtask, { status: 201 });
}
