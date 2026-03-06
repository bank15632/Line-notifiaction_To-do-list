import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "To-Do List + LINE Bot",
  description: "Task management system with LINE notifications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-indigo-600">
              To-Do List
            </Link>
            <Link
              href="/projects"
              className="text-gray-600 hover:text-indigo-600 text-sm"
            >
              All Projects
            </Link>
            <Link
              href="/settings"
              className="text-gray-600 hover:text-indigo-600 text-sm"
            >
              LINE Settings
            </Link>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
