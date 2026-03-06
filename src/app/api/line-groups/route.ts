import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await prisma.lineGroup.findMany({
    include: {
      projects: {
        include: {
          project: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const group = await prisma.lineGroup.create({
    data: {
      groupId: body.groupId,
      name: body.name,
      notifyFrequency: body.notifyFrequency || "DAILY",
      notifyTime: body.notifyTime || "09:00",
    },
  });
  return NextResponse.json(group, { status: 201 });
}
