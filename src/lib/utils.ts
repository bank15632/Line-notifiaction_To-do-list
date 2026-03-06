export function daysRemaining(deadline: Date | string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysRemaining(deadline: Date | string): string {
  const days = daysRemaining(deadline);
  if (days > 0) return `เหลือ ${days} วัน`;
  if (days === 0) return `ครบกำหนดวันนี้`;
  return `เลยกำหนด ${Math.abs(days)} วัน`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function statusLabel(status: string): string {
  switch (status) {
    case "TODO":
      return "รอดำเนินการ";
    case "DOING":
      return "กำลังทำ";
    case "DONE":
      return "เสร็จแล้ว";
    default:
      return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "TODO":
      return "bg-gray-200 text-gray-700";
    case "DOING":
      return "bg-blue-100 text-blue-700";
    case "DONE":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function completionPercent(
  todoCount: number,
  doingCount: number,
  doneCount: number
): number {
  const total = todoCount + doingCount + doneCount;
  if (total === 0) return 0;
  return Math.round((doneCount / total) * 100);
}
