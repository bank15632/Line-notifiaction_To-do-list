import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature, getGroupName } from "@/lib/line";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsed = JSON.parse(body);
  const events = parsed.events || [];

  for (const event of events) {
    if (event.type === "join" && event.source?.type === "group") {
      const groupId = event.source.groupId;
      const groupName = await getGroupName(groupId);

      await prisma.lineGroup.upsert({
        where: { groupId },
        update: { name: groupName },
        create: { groupId, name: groupName },
      });
    }

    if (event.type === "leave" && event.source?.type === "group") {
      const groupId = event.source.groupId;
      await prisma.lineGroup
        .delete({ where: { groupId } })
        .catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
