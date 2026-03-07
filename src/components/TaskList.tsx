"use client";

import { useState } from "react";
import TaskRow from "./TaskRow";

interface SubTask {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: string;
  dependsOnTaskId: string | null;
  dependsOnSubId: string | null;
}

interface Task {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: string;
  projectId: string;
  dependsOnTask?: { id: string; name: string } | null;
  dependsOnSub?: { id: string; name: string } | null;
  subTasks: SubTask[];
}

interface TaskListProps {
  tasks: Task[];
  allTasks: { id: string; name: string; subTasks: { id: string; name: string }[] }[];
}

export default function TaskList({ tasks, allTasks }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = statusFilter === "ALL"
    ? tasks
    : tasks.filter((t) => t.status === statusFilter);

  const filters = [
    { label: "All", value: "ALL", count: tasks.length },
    { label: "Todo", value: "TODO", count: tasks.filter((t) => t.status === "TODO").length },
    { label: "Doing", value: "DOING", count: tasks.filter((t) => t.status === "DOING").length },
    { label: "Done", value: "DONE", count: tasks.filter((t) => t.status === "DONE").length },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              statusFilter === f.value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No tasks match this filter</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} allTasks={allTasks} />
          ))}
        </div>
      )}
    </div>
  );
}
