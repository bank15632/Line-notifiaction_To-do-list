import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProjectList from "@/components/ProjectList";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projectsWithStats: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    emoji: string;
    todoCount: number;
    doingCount: number;
    doneCount: number;
    totalTasks: number;
    completionPercent: number;
    createdAt: string;
    updatedAt: string;
  }[] = [];
  let error: string | null = null;

  try {
    const projects = await prisma.project.findMany({
      where: { archived: false },
      include: {
        tasks: { include: { subTasks: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    projectsWithStats = projects.map((p) => {
      const allItems = [
        ...p.tasks.map((t) => t.status),
        ...p.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
      ];
      const todoCount = allItems.filter((s) => s === "TODO").length;
      const doingCount = allItems.filter((s) => s === "DOING").length;
      const doneCount = allItems.filter((s) => s === "DONE").length;
      const total = allItems.length;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        emoji: p.emoji,
        todoCount,
        doingCount,
        doneCount,
        totalTasks: total,
        completionPercent: total === 0 ? 0 : Math.round((doneCount / total) * 100),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });
  } catch (e) {
    console.error("Failed to load projects:", e);
    error = "Failed to load projects. Please try again.";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Projects</h1>
        <div className="flex gap-2">
          <Link
            href="/projects/archive"
            className="text-gray-500 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Archived
          </Link>
          <Link
            href="/projects/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            + New Project
          </Link>
        </div>
      </div>

      {error ? (
        <div className="text-center py-16">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-gray-400 text-sm">
            If the problem persists, check your DATABASE_URL in Vercel settings.
          </p>
        </div>
      ) : projectsWithStats.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No projects yet</p>
          <Link href="/projects/new" className="text-indigo-600 hover:underline">
            Create your first project
          </Link>
        </div>
      ) : (
        <ProjectList projects={projectsWithStats} />
      )}
    </div>
  );
}
