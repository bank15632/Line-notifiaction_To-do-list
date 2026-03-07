"use client";

import { useState } from "react";
import { ProjectWithStats } from "@/types";
import ProjectCard from "./ProjectCard";

export default function ProjectList({ projects }: { projects: ProjectWithStats[] }) {
  const categories = Array.from(new Set(projects.map((p) => p.category))).sort();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

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
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-8">No projects in this category</p>
      )}
    </div>
  );
}
