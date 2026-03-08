"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchiveProjectButton({
  projectId,
  archived,
}: {
  projectId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const action = archived ? "unarchive" : "archive";
    if (!confirm(`${archived ? "Unarchive" : "Archive"} this project?`)) return;

    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !archived }),
      });
      if (!archived) {
        router.push("/projects");
      } else {
        router.refresh();
      }
    } catch {
      alert(`Failed to ${action} project`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
        archived
          ? "text-green-600 border-green-300 hover:bg-green-50"
          : "text-amber-600 border-amber-300 hover:bg-amber-50"
      }`}
    >
      {loading ? "..." : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
