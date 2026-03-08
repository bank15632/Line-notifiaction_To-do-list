"use client";

import Link from "next/link";
import { ProjectWithStats } from "@/types";

function daysAgo(dateStr: string): number {
  const created = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectCard({ project }: { project: ProjectWithStats }) {
  const pct = project.completionPercent;
  const age = daysAgo(project.createdAt);

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-gray-800">
            <span className="mr-1.5">{project.emoji || "\u{1F4CB}"}</span>
            {project.name}
          </h3>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full whitespace-nowrap">
            {project.category}
          </span>
        </div>
        {project.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {project.description}
          </p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          Created {formatDate(project.createdAt)} ({age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} ago`})
        </p>

        <div className="mt-3">
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
          <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded">
            Checking: {project.checkingCount}
          </span>
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded">
            Done: {project.doneCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
