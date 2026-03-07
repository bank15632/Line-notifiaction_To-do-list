"use client";

import { useState, useEffect } from "react";

interface SubTaskEditFormProps {
  subtaskId: string;
  projectId: string;
  allTasks?: { id: string; name: string; subTasks: { id: string; name: string }[] }[];
  onClose: () => void;
}

export default function SubTaskEditForm({ subtaskId, projectId, allTasks, onClose }: SubTaskEditFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("TODO");
  const [dependsOnTaskId, setDependsOnTaskId] = useState("");
  const [dependsOnSubId, setDependsOnSubId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const allSubTasks = (allTasks || []).flatMap((t) =>
    t.subTasks.filter((s) => s.id !== subtaskId).map((s) => ({ ...s, taskName: t.name }))
  );

  useEffect(() => {
    fetch(`/api/subtasks/${subtaskId}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description || "");
        setDeadline(data.deadline ? data.deadline.split("T")[0] : "");
        setStatus(data.status);
        setDependsOnTaskId(data.dependsOnTaskId || "");
        setDependsOnSubId(data.dependsOnSubId || "");
        setFetching(false);
      });
  }, [subtaskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
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
      if (!res.ok) throw new Error("Failed");
      onClose();
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-xs text-gray-400 py-2">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-amber-50 space-y-3 mt-2">
      <h4 className="font-medium text-sm text-gray-700">Edit Sub-task</h4>
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
      <div className="flex gap-3">
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="TODO">Todo</option>
          <option value="DOING">Doing</option>
          <option value="DONE">Done</option>
        </select>
      </div>
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
          className="bg-amber-600 text-white px-4 py-1.5 rounded text-sm hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
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
