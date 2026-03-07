import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderedIds } = body as { orderedIds: string[] };

  // Update sortOrder for each project
  const updates = orderedIds.map((id, index) =>
    prisma.project.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ success: true });
}
