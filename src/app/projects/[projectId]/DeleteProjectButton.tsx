"use client";

import { useRouter } from "next/navigation";

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this project? All tasks will be deleted too.")) return;
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    router.push("/projects");
  };

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      Delete Project
    </button>
  );
}
