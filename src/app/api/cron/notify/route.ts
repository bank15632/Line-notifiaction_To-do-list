import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushTextMessage } from "@/lib/line";
import { buildNotificationMessage } from "@/lib/notification";

function shouldNotify(
  frequencyDays: number,
  lastNotifiedAt: Date | null
): boolean {
  if (!lastNotifiedAt) return true;

  const now = new Date();
  const diffMs = now.getTime() - lastNotifiedAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= frequencyDays;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.lineGroup.findMany({
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

  let notifiedCount = 0;

  for (const group of groups) {
    if (!shouldNotify(group.notifyFrequency, group.lastNotifiedAt)) {
      continue;
    }

    if (group.projects.length === 0) continue;

    const message = buildNotificationMessage(group.projects);

    try {
      await pushTextMessage(group.groupId, message);
      await prisma.lineGroup.update({
        where: { id: group.id },
        data: { lastNotifiedAt: new Date() },
      });
      notifiedCount++;
    } catch (err) {
      console.error(`Failed to notify group ${group.name}:`, err);
    }
  }

  return NextResponse.json({ success: true, notifiedCount });
}
