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
      tasks: {
        include: {
          subTasks: true,
          dependsOnTask: { select: { id: true, name: true } },
          dependsOnSub: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      lineGroups: {
        include: {
          lineGroup: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "ไม่พบโปรเจค" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: body.name,
      description: body.description,
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ success: true });
}
