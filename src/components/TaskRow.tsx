"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import DaysRemainingBadge from "./DaysRemaining";
import SubTaskForm from "./SubTaskForm";
import SubTaskEditForm from "./SubTaskEditForm";

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

interface TaskRowProps {
  task: Task;
  allTasks?: { id: string; name: string; subTasks: { id: string; name: string }[] }[];
}

export default function TaskRow({ task, allTasks }: TaskRowProps) {
  const router = useRouter();
  const [showSubForm, setShowSubForm] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const handleSubStatusChange = async (subId: string, newStatus: string) => {
    await fetch(`/api/subtasks/${subId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const handleDeleteTask = async () => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm("Delete this sub-task?")) return;
    await fetch(`/api/subtasks/${subId}`, { method: "DELETE" });
    router.refresh();
  };

  const doneCount = task.subTasks.filter((s) => s.status === "DONE").length;
  const totalSubs = task.subTasks.length;
  const subProgress = totalSubs > 0 ? Math.round((doneCount / totalSubs) * 100) : 0;

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800">{task.name}</h3>
            <StatusBadge status={task.status} />
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
          {task.deadline && (
            <div className="mt-1">
              <DaysRemainingBadge deadline={task.deadline} />
            </div>
          )}
          {task.dependsOnTask && (
            <p className="text-sm text-amber-600 mt-1">
              Depends on Task: {task.dependsOnTask.name}
            </p>
          )}
          {task.dependsOnSub && (
            <p className="text-sm text-amber-600 mt-1">
              Depends on Sub-task: {task.dependsOnSub.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs border rounded px-1 py-0.5"
          >
            <option value="TODO">Todo</option>
            <option value="DOING">Doing</option>
            <option value="DONE">Done</option>
          </select>
          <Link
            href={`/projects/${task.projectId}/tasks/${task.id}/edit`}
            className="text-indigo-500 hover:text-indigo-700 text-xs px-1"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteTask}
            className="text-red-400 hover:text-red-600 text-xs px-1"
          >
            Delete
          </button>
        </div>
      </div>

      {totalSubs > 0 && (
        <div className="px-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Sub-tasks: {doneCount}/{totalSubs} done</span>
            <span>{subProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${subProgress}%` }}
            />
          </div>
        </div>
      )}

      {task.subTasks.length > 0 && (
        <div className="pl-4 border-l-2 border-indigo-100 space-y-2">
          {task.subTasks.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start justify-between gap-2 py-1"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-700">{sub.name}</span>
                  <StatusBadge status={sub.status} />
                </div>
                {sub.description && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sub.description}
                  </p>
                )}
                {sub.deadline && (
                  <div className="mt-0.5">
                    <DaysRemainingBadge deadline={sub.deadline} />
                  </div>
                )}
                {sub.dependsOnTaskId && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Depends on Task ID: {sub.dependsOnTaskId}
                  </p>
                )}
                {sub.dependsOnSubId && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Depends on Sub-task ID: {sub.dependsOnSubId}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={sub.status}
                  onChange={(e) => handleSubStatusChange(sub.id, e.target.value)}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="TODO">Todo</option>
                  <option value="DOING">Doing</option>
                  <option value="DONE">Done</option>
                </select>
                <button
                  onClick={() => setEditingSubId(sub.id)}
                  className="text-indigo-500 hover:text-indigo-700 text-xs px-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSub(sub.id)}
                  className="text-red-400 hover:text-red-600 text-xs px-1"
                >
                  Delete
                </button>
              </div>
              {editingSubId === sub.id && (
                <SubTaskEditForm
                  subtaskId={sub.id}
                  projectId={task.projectId}
                  allTasks={allTasks}
                  onClose={() => {
                    setEditingSubId(null);
                    router.refresh();
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowSubForm(!showSubForm)}
        className="text-xs text-indigo-600 hover:underline"
      >
        + Add Sub-task
      </button>

      {showSubForm && (
        <SubTaskForm
          taskId={task.id}
          projectId={task.projectId}
          onClose={() => setShowSubForm(false)}
          allTasks={allTasks}
        />
      )}
    </div>
  );
}
