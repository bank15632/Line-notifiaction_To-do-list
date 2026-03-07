import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushTextMessage } from "@/lib/line";
import { buildNotificationMessage } from "@/lib/notification";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;

  const group = await prisma.lineGroup.findUnique({
    where: { id: groupId },
    include: {
      projects: {
        include: {
          project: {
            include: {
              tasks: {
                include: {
                  subTasks: true,
                  dependsOnTask: { select: { id: true, name: true } },
                  dependsOnSub: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.projects.length === 0) {
    return NextResponse.json({ error: "No projects assigned to this group" }, { status: 400 });
  }

  const message = buildNotificationMessage(group.projects);

  try {
    await pushTextMessage(group.groupId, message);
    await prisma.lineGroup.update({
      where: { id: group.id },
      data: { lastNotifiedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`Failed to notify group ${group.name}:`, err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
