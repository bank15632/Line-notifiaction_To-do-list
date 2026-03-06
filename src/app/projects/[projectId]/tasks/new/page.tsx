import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        include: {
          subTasks: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!project) return notFound();

  const allTasks = project.tasks.map((t) => ({
    id: t.id,
    name: t.name,
    subTasks: t.subTasks,
  }));

  return (
    <div>
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-gray-400 hover:text-indigo-600"
      >
        &larr; Back to {project.name}
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">
        New Task
      </h1>
      <div className="max-w-lg">
        <TaskForm projectId={projectId} allTasks={allTasks} />
      </div>
    </div>
  );
}
