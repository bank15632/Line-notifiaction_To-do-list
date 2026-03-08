"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TaskFormProps {
  projectId: string;
  allTasks: { id: string; name: string; subTasks: { id: string; name: string }[] }[];
  initialData?: {
    name: string;
    description: string;
    deadline: string;
    status: string;
    dependsOnTaskId: string;
    dependsOnSubId: string;
  };
  taskId?: string;
}

export default function TaskForm({
  projectId,
  allTasks,
  initialData,
  taskId,
}: TaskFormProps) {
  const router = useRouter();
  const isEdit = !!taskId;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [deadline, setDeadline] = useState(initialData?.deadline || "");
  const [status, setStatus] = useState(initialData?.status || "TODO");
  const [dependsOnTaskId, setDependsOnTaskId] = useState(initialData?.dependsOnTaskId || "");
  const [dependsOnSubId, setDependsOnSubId] = useState(initialData?.dependsOnSubId || "");
  const [hasSubTasks, setHasSubTasks] = useState(false);
  const [subTasks, setSubTasks] = useState<
    { name: string; description: string; deadline: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const addSubTask = () => {
    setSubTasks([...subTasks, { name: "", description: "", deadline: "" }]);
  };

  const updateSubTask = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...subTasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubTasks(updated);
  };

  const removeSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        name,
        description,
        deadline: deadline || null,
        status,
        projectId,
        dependsOnTaskId: dependsOnTaskId || null,
        dependsOnSubId: dependsOnSubId || null,
      };

      let res;
      if (isEdit) {
        res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      } else {
        res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      }

      if (!res.ok) throw new Error("Failed to save task");
      const savedTask = await res.json();

      if (!isEdit && hasSubTasks) {
        for (const sub of subTasks) {
          if (!sub.name) continue;
          await fetch("/api/subtasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: sub.name,
              description: sub.description,
              deadline: sub.deadline || null,
              taskId: savedTask.id,
            }),
          });
        }
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const allSubTasks = allTasks.flatMap((t) =>
    t.subTasks.map((s) => ({ ...s, taskName: t.name }))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          value={dependsOnTaskId}
          onChange={(e) => {
            setDependsOnTaskId(e.target.value);
            if (e.target.value) setDependsOnSubId("");
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">-- None --</option>
          {allTasks
            .filter((t) => t.id !== taskId)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Depends on Sub-task
        </label>
        <select
          value={dependsOnSubId}
          onChange={(e) => {
            setDependsOnSubId(e.target.value);
            if (e.target.value) setDependsOnTaskId("");
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">-- None --</option>
          {allSubTasks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.taskName} &gt; {s.name}
            </option>
          ))}
        </select>
      </div>

      {!isEdit && (
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasSubTasks}
              onChange={(e) => setHasSubTasks(e.target.checked)}
              className="rounded"
            />
            <span className="font-medium text-gray-700">
              Has Sub-tasks
            </span>
          </label>

          {hasSubTasks && (
            <div className="mt-3 space-y-3">
              {subTasks.map((sub, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 bg-gray-50 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Sub-task #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubTask(i)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Sub-task name"
                    value={sub.name}
                    onChange={(e) => updateSubTask(i, "name", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={sub.description}
                    onChange={(e) =>
                      updateSubTask(i, "description", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="date"
                    value={sub.deadline}
                    onChange={(e) =>
                      updateSubTask(i, "deadline", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSubTask}
                className="text-sm text-indigo-600 hover:underline"
              >
                + Add Sub-task
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
      </button>
    </form>
  );
}
