import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        ระบบจัดการงาน To-Do List
      </h1>
      <p className="text-gray-500 mb-8">
        จัดการโปรเจค, งาน และ Sub-task พร้อมแจ้งเตือนผ่าน LINE Bot
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/projects"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          ดูโปรเจคทั้งหมด
        </Link>
        <Link
          href="/projects/new"
          className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
        >
          สร้างโปรเจคใหม่
        </Link>
      </div>
    </div>
  );
}
