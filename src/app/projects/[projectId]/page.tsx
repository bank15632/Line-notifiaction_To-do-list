import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TaskRow from "@/components/TaskRow";
import DeleteProjectButton from "./DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
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
          subTasks: true,
          dependsOnTask: { select: { id: true, name: true } },
          dependsOnSub: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) return notFound();

  const allItems = [
    ...project.tasks.map((t) => t.status),
    ...project.tasks.flatMap((t) => t.subTasks.map((s) => s.status)),
  ];
  const todoCount = allItems.filter((s) => s === "TODO").length;
  const doingCount = allItems.filter((s) => s === "DOING").length;
  const doneCount = allItems.filter((s) => s === "DONE").length;
  const total = allItems.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const tasksForJson = project.tasks.map((t) => ({
    ...t,
    deadline: t.deadline?.toISOString() || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subTasks: t.subTasks.map((s) => ({
      ...s,
      deadline: s.deadline?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  }));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/projects"
            className="text-sm text-gray-400 hover:text-indigo-600"
          >
            &larr; โปรเจคทั้งหมด
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projects/${projectId}/edit`}
            className="text-sm text-gray-500 border px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            แก้ไข
          </Link>
          <DeleteProjectButton projectId={projectId} />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-gray-700">ความสำเร็จของโปรเจค</span>
          <span className="text-2xl font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">
            รอดำเนินการ: <span className="font-semibold text-gray-700">{todoCount}</span>
          </span>
          <span className="text-blue-500">
            กำลังทำ: <span className="font-semibold text-blue-700">{doingCount}</span>
          </span>
          <span className="text-green-500">
            เสร็จแล้ว: <span className="font-semibold text-green-700">{doneCount}</span>
          </span>
          <span className="text-gray-400">
            ทั้งหมด: {total}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">รายการงาน</h2>
        <Link
          href={`/projects/${projectId}/tasks/new`}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          + เพิ่ม Task
        </Link>
      </div>

      {tasksForJson.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>ยังไม่มี Task</p>
          <Link
            href={`/projects/${projectId}/tasks/new`}
            className="text-indigo-600 hover:underline text-sm"
          >
            เพิ่ม Task แรก
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasksForJson.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
