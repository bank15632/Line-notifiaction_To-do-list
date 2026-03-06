import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TaskRow from "@/components/TaskRow";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = await params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      subTasks: true,
      dependsOnTask: { select: { id: true, name: true } },
      dependsOnSub: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!task) return notFound();

  const taskData = {
    ...task,
    deadline: task.deadline?.toISOString() || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    subTasks: task.subTasks.map((s) => ({
      ...s,
      deadline: s.deadline?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  };

  return (
    <div>
      <Link
        href={`/projects/${projectId}`}
        className="text-sm text-gray-400 hover:text-indigo-600"
      >
        &larr; Back to {task.project.name}
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">
        Task Details
      </h1>
      <TaskRow task={taskData} />
      <div className="mt-4">
        <Link
          href={`/projects/${projectId}/tasks/${taskId}/edit`}
          className="text-sm text-indigo-600 hover:underline"
        >
          Edit this Task
        </Link>
      </div>
    </div>
  );
}
