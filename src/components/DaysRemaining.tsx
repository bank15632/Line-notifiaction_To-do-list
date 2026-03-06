"use client";

import { daysRemaining, formatDaysRemaining, formatDate } from "@/lib/utils";

export default function DaysRemainingBadge({
  deadline,
}: {
  deadline: string;
}) {
  const days = daysRemaining(deadline);
  let colorClass = "text-gray-500";
  if (days < 0) colorClass = "text-red-600 font-medium";
  else if (days === 0) colorClass = "text-orange-600 font-medium";
  else if (days <= 3) colorClass = "text-yellow-600";

  return (
    <span className={`text-sm ${colorClass}`}>
      {formatDate(deadline)} ({formatDaysRemaining(deadline)})
    </span>
  );
}
