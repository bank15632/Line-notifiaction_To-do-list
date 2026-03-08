"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DeadlineItem {
  id: string;
  name: string;
  type: "task" | "subtask";
  status: string;
  deadline: string;
  projectName: string;
  projectId: string;
  category: string;
  emoji: string;
  parentTaskName?: string;
}

function daysRemaining(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusColor(status: string) {
  switch (status) {
    case "TODO": return "bg-gray-100 text-gray-700";
    case "DOING": return "bg-blue-100 text-blue-700";
    case "DONE": return "bg-green-100 text-green-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function DeadlineCard({ title, items, color }: { title: string; items: DeadlineItem[]; color: string }) {
  if (items.length === 0) {
    return (
      <div className={`border rounded-lg p-4 ${color}`}>
        <h3 className="font-semibold text-sm mb-2">{title}</h3>
        <p className="text-xs text-gray-400">No items</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${color}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs font-bold bg-white/70 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {items.map((item) => {
          const days = daysRemaining(item.deadline);
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/projects/${item.projectId}`}
              className="block bg-white rounded px-3 py-2 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">{item.emoji}</span>
                <span className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0">{item.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${statusColor(item.status)}`}>
                  {item.status === "TODO" ? "Todo" : item.status === "DOING" ? "Doing" : "Done"}
                </span>
                {item.type === "subtask" && (
                  <span className="text-[10px] text-gray-400 shrink-0">sub-task</span>
                )}
                <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">{formatDate(item.deadline)}</span>
                <span className={`text-xs font-semibold shrink-0 ${days < 0 ? "text-red-600" : days === 0 ? "text-orange-600" : days <= 3 ? "text-amber-600" : "text-gray-500"}`}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 ml-7 truncate">
                {item.projectName}{item.parentTaskName ? ` > ${item.parentTaskName}` : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function NotificationDashboard() {
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"subtask" | "task">("subtask");

  useEffect(() => {
    fetch("/api/deadlines")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();

  // Filter out DONE items, apply category and type filter
  const active = items.filter((i) => {
    if (i.status === "DONE") return false;
    if (selectedCategory !== "All" && i.category !== selectedCategory) return false;
    if (i.type !== typeFilter) return false;
    return true;
  });

  const today = active.filter((i) => daysRemaining(i.deadline) <= 0);
  const thisWeek = active.filter((i) => { const d = daysRemaining(i.deadline); return d > 0 && d <= 7; });
  const thisMonth = active.filter((i) => { const d = daysRemaining(i.deadline); return d > 7 && d <= 30; });
  const thisYear = active.filter((i) => { const d = daysRemaining(i.deadline); return d > 30 && d <= 365; });

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Notification Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Tasks and sub-tasks approaching their deadlines</p>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedCategory === "All"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTypeFilter("subtask")}
          className={`px-3 py-1 rounded-full text-sm transition ${
            typeFilter === "subtask"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sub-Tasks
        </button>
        <button
          onClick={() => setTypeFilter("task")}
          className={`px-3 py-1 rounded-full text-sm transition ${
            typeFilter === "task"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tasks
        </button>
      </div>

      <div className="space-y-4">
        <DeadlineCard title="Overdue / Today" items={today} color="bg-red-50 border-red-200" />
        <DeadlineCard title="This Week" items={thisWeek} color="bg-orange-50 border-orange-200" />
        <DeadlineCard title="This Month" items={thisMonth} color="bg-yellow-50 border-yellow-200" />
        <DeadlineCard title="This Year" items={thisYear} color="bg-green-50 border-green-200" />
      </div>

      {active.length === 0 && (
        <p className="text-center text-gray-400 py-8 mt-4">No upcoming deadlines. All clear!</p>
      )}
    </div>
  );
}
