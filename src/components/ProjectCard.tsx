"use client";

import Link from "next/link";
import { ProjectWithStats } from "@/types";

export default function ProjectCard({ project }: { project: ProjectWithStats }) {
  const pct = project.completionPercent;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition cursor-pointer">
        <h3 className="font-semibold text-lg text-gray-800">{project.name}</h3>
        {project.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Completion</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex gap-3 text-xs">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Todo: {project.todoCount}
          </span>
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
            Doing: {project.doingCount}
          </span>
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded">
            Done: {project.doneCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
