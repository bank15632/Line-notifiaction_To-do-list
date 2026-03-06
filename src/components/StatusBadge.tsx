"use client";

import { statusLabel, statusColor } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}
