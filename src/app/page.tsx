import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        To-Do List Manager
      </h1>
      <p className="text-gray-500 mb-8">
        Manage projects, tasks and sub-tasks with LINE Bot notifications
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/projects"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          View All Projects
        </Link>
        <Link
          href="/projects/new"
          className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
        >
          New Project
        </Link>
      </div>
    </div>
  );
}
