"use client";

import { useState, useEffect, useCallback } from "react";

interface Project {
  id: string;
  name: string;
}

interface LineGroup {
  id: string;
  groupId: string;
  name: string;
  notifyFrequency: number;
  notifyTime: string;
  projects: {
    id: string;
    projectId: string;
    project: { id: string; name: string };
  }[];
}

export default function SettingsPage() {
  const [groups, setGroups] = useState<LineGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [gRes, pRes] = await Promise.all([
      fetch("/api/line-groups"),
      fetch("/api/projects"),
    ]);
    setGroups(await gRes.json());
    setProjects(await pRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/line-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: newGroupId, name: newGroupName }),
      });
      setNewGroupId("");
      setNewGroupName("");
      await fetchData();
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    await fetch(`/api/line-groups/${id}`, { method: "DELETE" });
    await fetchData();
  };

  const updateFrequency = async (id: string, days: number) => {
    await fetch(`/api/line-groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyFrequency: days }),
    });
    await fetchData();
  };

  const notifyNow = async (id: string) => {
    setNotifyingId(id);
    try {
      const res = await fetch(`/api/line-groups/${id}/notify`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to send notification");
      } else {
        alert("Notification sent!");
      }
    } catch {
      alert("Failed to send notification");
    } finally {
      setNotifyingId(null);
    }
  };

  const toggleProject = async (
    groupId: string,
    projectId: string,
    isAssigned: boolean
  ) => {
    if (isAssigned) {
      await fetch("/api/project-line-groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, lineGroupId: groupId }),
      });
    } else {
      await fetch("/api/project-line-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, lineGroupId: groupId }),
      });
    }
    await fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        LINE Bot Settings
      </h1>

      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">
          Add LINE Group Manually
        </h2>
        <p className="text-sm text-gray-400 mb-3">
          Or add the Bot to a LINE group and it will register automatically
        </p>
        <form onSubmit={addGroup} className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="LINE Group ID"
            value={newGroupId}
            onChange={(e) => setNewGroupId(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <input
            type="text"
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[150px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No LINE groups registered
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white border rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ID: {group.groupId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => notifyNow(group.id)}
                    disabled={notifyingId === group.id}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {notifyingId === group.id ? "Sending..." : "Notify Now"}
                  </button>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete Group
                  </button>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <label className="text-sm text-gray-600">
                  Notify every
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={group.notifyFrequency}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0) updateFrequency(group.id, val);
                  }}
                  className="border rounded px-2 py-1 text-sm w-20 text-center"
                />
                <span className="text-sm text-gray-600">
                  day{group.notifyFrequency !== 1 ? "s" : ""}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Notified Projects:
                </p>
                {projects.length === 0 ? (
                  <p className="text-xs text-gray-400">No projects yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {projects.map((p) => {
                      const isAssigned = group.projects.some(
                        (gp) => gp.project.id === p.id
                      );
                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            toggleProject(group.id, p.id, isAssigned)
                          }
                          className={`px-3 py-1 rounded-full text-xs border transition ${
                            isAssigned
                              ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                              : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          {isAssigned ? "v " : ""}
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
