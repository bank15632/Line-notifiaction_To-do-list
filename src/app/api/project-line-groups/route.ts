import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const link = await prisma.projectLineGroup.create({
    data: {
      projectId: body.projectId,
      lineGroupId: body.lineGroupId,
    },
  });
  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.projectLineGroup.delete({
    where: {
      projectId_lineGroupId: {
        projectId: body.projectId,
        lineGroupId: body.lineGroupId,
      },
    },
  });
  return NextResponse.json({ success: true });
}
