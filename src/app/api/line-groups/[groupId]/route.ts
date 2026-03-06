import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const body = await req.json();
  const group = await prisma.lineGroup.update({
    where: { id: groupId },
    data: {
      name: body.name,
      notifyFrequency: body.notifyFrequency,
      notifyTime: body.notifyTime,
    },
  });
  return NextResponse.json(group);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  await prisma.lineGroup.delete({ where: { id: groupId } });
  return NextResponse.json({ success: true });
}
