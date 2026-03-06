"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubTaskFormProps {
  taskId: string;
  projectId: string;
  onClose: () => void;
}

export default function SubTaskForm({ taskId, projectId, onClose }: SubTaskFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

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
        }),
      });
      if (!res.ok) throw new Error("Failed");
      onClose();
      router.refresh();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3 mt-2">
      <h4 className="font-medium text-sm text-gray-700">เพิ่ม Sub-task ใหม่</h4>
      <input
        type="text"
        placeholder="ชื่อ Sub-task"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border rounded px-3 py-1.5 text-sm"
      />
      <input
        type="text"
        placeholder="รายละเอียด"
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
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "เพิ่ม"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 text-sm hover:underline"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
