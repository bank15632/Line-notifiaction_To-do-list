"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubTaskFormProps {
  taskId: string;
  projectId: string;
  onClose: () => void;
  allTasks?: { id: string; name: string; subTasks: { id: string; name: string }[] }[];
}

export default function SubTaskForm({ taskId, projectId, onClose, allTasks }: SubTaskFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dependsOnTaskId, setDependsOnTaskId] = useState("");
  const [dependsOnSubId, setDependsOnSubId] = useState("");
  const [loading, setLoading] = useState(false);

  const allSubTasks = (allTasks || []).flatMap((t) =>
    t.subTasks.map((s) => ({ ...s, taskName: t.name }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          deadline: deadline || null,
          taskId,
          dependsOnTaskId: dependsOnTaskId || null,
          dependsOnSubId: dependsOnSubId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      onClose();
      router.refresh();
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3 mt-2">
      <h4 className="font-medium text-sm text-gray-700">Add New Sub-task</h4>
      <input
        type="text"
        placeholder="Sub-task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border rounded px-3 py-1.5 text-sm"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded px-3 py-1.5 text-sm"
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="border rounded px-3 py-1.5 text-sm"
      />
      {allTasks && allTasks.length > 0 && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Depends on Task
            </label>
            <select
              value={dependsOnTaskId}
              onChange={(e) => {
                setDependsOnTaskId(e.target.value);
                if (e.target.value) setDependsOnSubId("");
              }}
              className="w-full border rounded px-3 py-1.5 text-sm"
            >
              <option value="">-- None --</option>
              {allTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Depends on Sub-task
            </label>
            <select
              value={dependsOnSubId}
              onChange={(e) => {
                setDependsOnSubId(e.target.value);
                if (e.target.value) setDependsOnTaskId("");
              }}
              className="w-full border rounded px-3 py-1.5 text-sm"
            >
              <option value="">-- None --</option>
              {allSubTasks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.taskName} &gt; {s.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 text-sm hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
