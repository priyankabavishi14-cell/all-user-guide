import Link from 'next/link';
import type { Project } from '@/types';

interface Props {
  project: Project;
}

export default function AdminSidebar({ project }: Props) {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col min-h-full">
      <div className="p-4 border-b border-[#e5e7eb]">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
          Switch Project
        </p>
        <div className="flex items-center justify-between bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2 cursor-pointer hover:border-[#5b5ce2] transition-colors">
          <span className="text-sm text-[#111827] font-medium truncate">{project.title}</span>
          <span className="text-[#6b7280] ml-1 text-xs">▾</span>
        </div>
        <a href="#" className="block mt-2 text-xs text-[#5b5ce2] hover:underline text-center">
          Manage All Projects
        </a>
      </div>

      <nav className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
          Management
        </p>
        <Link
          href={`/admin/${project.slug}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ede9fe] text-[#5b5ce2] font-medium text-sm"
        >
          <span>📊</span>
          Dashboard
        </Link>
        <Link
          href={`/admin/${project.slug}/pages`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#374151] hover:bg-[#f9fafb] text-sm transition-colors"
        >
          <span>📄</span>
          Manage Pages
        </Link>
      </nav>

      <div className="p-4 border-t border-[#e5e7eb]">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
          Content
        </p>
        <Link
          href={`/admin/${project.slug}/pages/new`}
          className="block w-full text-center bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Create New Page
        </Link>
      </div>
    </aside>
  );
}
