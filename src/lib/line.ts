import { Client, validateSignature } from "@line/bot-sdk";

function getClient(): Client {
  return new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
    channelSecret: process.env.LINE_CHANNEL_SECRET || "",
  });
}

export function verifySignature(body: string, signature: string): boolean {
  return validateSignature(
    body,
    process.env.LINE_CHANNEL_SECRET || "",
    signature
  );
}

export async function pushTextMessage(
  groupId: string,
  text: string
): Promise<void> {
  await getClient().pushMessage(groupId, { type: "text", text });
}

export async function getGroupName(groupId: string): Promise<string> {
  try {
    const summary = await getClient().getGroupSummary(groupId);
    return summary.groupName;
  } catch {
    return "Unknown Group";
  }
}
