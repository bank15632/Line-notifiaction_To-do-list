"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import DaysRemainingBadge from "./DaysRemaining";
import SubTaskForm from "./SubTaskForm";

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

export default function TaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const [showSubForm, setShowSubForm] = useState(false);

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
    if (!confirm("ต้องการลบ Task นี้?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm("ต้องการลบ Sub-task นี้?")) return;
    await fetch(`/api/subtasks/${subId}`, { method: "DELETE" });
    router.refresh();
  };

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
              รองานจาก Task: {task.dependsOnTask.name}
            </p>
          )}
          {task.dependsOnSub && (
            <p className="text-sm text-amber-600 mt-1">
              รองานจาก Sub-task: {task.dependsOnSub.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs border rounded px-1 py-0.5"
          >
            <option value="TODO">รอ</option>
            <option value="DOING">ทำอยู่</option>
            <option value="DONE">เสร็จ</option>
          </select>
          <button
            onClick={handleDeleteTask}
            className="text-red-400 hover:text-red-600 text-xs px-1"
          >
            ลบ
          </button>
        </div>
      </div>

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
                    รองานจาก Task ID: {sub.dependsOnTaskId}
                  </p>
                )}
                {sub.dependsOnSubId && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    รองานจาก Sub-task ID: {sub.dependsOnSubId}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={sub.status}
                  onChange={(e) => handleSubStatusChange(sub.id, e.target.value)}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="TODO">รอ</option>
                  <option value="DOING">ทำอยู่</option>
                  <option value="DONE">เสร็จ</option>
                </select>
                <button
                  onClick={() => handleDeleteSub(sub.id)}
                  className="text-red-400 hover:text-red-600 text-xs px-1"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowSubForm(!showSubForm)}
        className="text-xs text-indigo-600 hover:underline"
      >
        + เพิ่ม Sub-task
      </button>

      {showSubForm && (
        <SubTaskForm
          taskId={task.id}
          projectId={task.projectId}
          onClose={() => setShowSubForm(false)}
        />
      )}
    </div>
  );
}
