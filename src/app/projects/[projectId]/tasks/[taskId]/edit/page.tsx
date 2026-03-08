"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface SubTaskOption {
  id: string;
  name: string;
}

interface TaskOption {
  id: string;
  name: string;
  subTasks: SubTaskOption[];
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const taskId = params.taskId as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("TODO");
  const [dependsOnTaskId, setDependsOnTaskId] = useState<string | null>(null);
  const [dependsOnSubId, setDependsOnSubId] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<TaskOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch task data
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description || "");
        setDeadline(data.deadline ? data.deadline.split("T")[0] : "");
        setStatus(data.status);
        setDependsOnTaskId(data.dependsOnTaskId || null);
        setDependsOnSubId(data.dependsOnSubId || null);
      });

    // Fetch project data to get allTasks for dependency dropdowns
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tasks) {
          const tasks: TaskOption[] = data.tasks
            .filter((t: TaskOption) => t.id !== taskId)
            .map((t: { id: string; name: string; subTasks: SubTaskOption[] }) => ({
              id: t.id,
              name: t.name,
              subTasks: t.subTasks || [],
            }));
          setAllTasks(tasks);
        }
      });
  }, [taskId, projectId]);

  const selectedTask = allTasks.find((t) => t.id === dependsOnTaskId);
  const availableSubs = selectedTask?.subTasks || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          deadline: deadline || null,
          status,
          dependsOnTaskId: dependsOnTaskId || null,
          dependsOnSubId: dependsOnSubId || null,
        }),
      });
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="TODO">Todo</option>
              <option value="DOING">Doing</option>
              <option value="CHECKING">Checking</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Depends on Task
          </label>
          <select
            value={dependsOnTaskId || ""}
            onChange={(e) => {
              setDependsOnTaskId(e.target.value || null);
              setDependsOnSubId(null);
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {allTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        {dependsOnTaskId && availableSubs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depends on Sub-task
            </label>
            <select
              value={dependsOnSubId || ""}
              onChange={(e) => setDependsOnSubId(e.target.value || null)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {availableSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
