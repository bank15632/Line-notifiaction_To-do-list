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
  notifyFrequency: string;
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
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("ต้องการลบกลุ่มนี้?")) return;
    await fetch(`/api/line-groups/${id}`, { method: "DELETE" });
    await fetchData();
  };

  const updateFrequency = async (id: string, freq: string) => {
    await fetch(`/api/line-groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyFrequency: freq }),
    });
    await fetchData();
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

  const freqLabel = (f: string) => {
    switch (f) {
      case "DAILY": return "ทุกวัน";
      case "EVERY_3_DAYS": return "ทุก 3 วัน";
      case "WEEKLY": return "ทุกอาทิตย์";
      default: return f;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        ตั้งค่า LINE Bot
      </h1>

      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">
          เพิ่มกลุ่ม LINE ด้วยตนเอง
        </h2>
        <p className="text-sm text-gray-400 mb-3">
          หรือเพิ่ม Bot เข้ากลุ่ม LINE แล้วระบบจะลงทะเบียนอัตโนมัติ
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
            placeholder="ชื่อกลุ่ม"
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
            เพิ่ม
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          ยังไม่มีกลุ่ม LINE ที่ลงทะเบียน
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
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  ลบกลุ่ม
                </button>
              </div>

              <div className="mb-3">
                <label className="text-sm text-gray-600 mr-2">
                  ความถี่แจ้งเตือน:
                </label>
                <select
                  value={group.notifyFrequency}
                  onChange={(e) => updateFrequency(group.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="DAILY">ทุกวัน</option>
                  <option value="EVERY_3_DAYS">ทุก 3 วัน</option>
                  <option value="WEEKLY">ทุกอาทิตย์</option>
                </select>
                <span className="text-sm text-gray-400 ml-2">
                  ({freqLabel(group.notifyFrequency)})
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  โปรเจคที่แจ้งเตือน:
                </p>
                {projects.length === 0 ? (
                  <p className="text-xs text-gray-400">ยังไม่มีโปรเจค</p>
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
