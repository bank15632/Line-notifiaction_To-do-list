import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArchivedProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { archived: true },
    include: {
      tasks: { include: { subTasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const projectsWithStats = projects.map((p) => {
    const allItems = [
      ...p.tasks.map((t) => t.status),
      ...p.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
    ];
    const doneCount = allItems.filter((s) => s === "DONE").length;
    const total = allItems.length;
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      completionPercent: pct,
      totalTasks: total,
    };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/projects" className="text-sm text-gray-400 hover:text-indigo-600">
            &larr; All Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Archived Projects</h1>
        </div>
      </div>

      {projectsWithStats.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No archived projects</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectsWithStats.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <div className="bg-white border rounded-lg p-5 hover:shadow-md transition opacity-75">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg text-gray-600">{p.name}</h3>
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    Archived
                  </span>
                </div>
                {p.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.description}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
                  <span>{p.category}</span>
                  <span>{p.completionPercent}% complete</span>
                  <span>{p.totalTasks} items</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
