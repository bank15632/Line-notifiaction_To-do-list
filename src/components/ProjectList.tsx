"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectWithStats } from "@/types";
import ProjectCard from "./ProjectCard";

export default function ProjectList({ projects: initialProjects }: { projects: ProjectWithStats[] }) {
  const router = useRouter();
  const categories = Array.from(new Set(initialProjects.map((p) => p.category))).sort();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [projects, setProjects] = useState(initialProjects);

  const filtered =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const moveProject = async (index: number, direction: "up" | "down") => {
    const newList = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setProjects(newList);

    await fetch("/api/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newList.map((p) => p.id) }),
    });
    router.refresh();
  };

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedCategory === "All"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({projects.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat} ({projects.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((project) => {
          const globalIndex = projects.findIndex((p) => p.id === project.id);
          return (
            <div key={project.id} className="relative group">
              <ProjectCard project={project} />
              <div className="absolute top-2 right-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition z-10">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveProject(globalIndex, "up"); }}
                  disabled={globalIndex === 0}
                  className="bg-white border shadow-sm rounded px-1.5 py-0.5 text-xs text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveProject(globalIndex, "down"); }}
                  disabled={globalIndex === projects.length - 1}
                  className="bg-white border shadow-sm rounded px-1.5 py-0.5 text-xs text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-8">No projects in this category</p>
      )}
    </div>
  );
}
