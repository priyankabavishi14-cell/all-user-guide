import Link from 'next/link'
import type { Project } from '@/types'
import ProjectSwitcher from './ProjectSwitcher'

interface Props {
  project: Project
  allProjects: Project[]
  activePage?: 'dashboard' | 'manage-pages' | 'users'
}

export default function AdminSidebar({ project, allProjects, activePage }: Props) {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
      <div className="p-4 border-b border-[#e5e7eb]">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
          Switch Project
        </p>
        <ProjectSwitcher currentProject={project} allProjects={allProjects} />
        <Link
          href="/admin"
          className="block mt-2 text-xs text-[#5b5ce2] hover:underline text-center"
        >
          Manage All Projects
        </Link>
      </div>

      <nav className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
          Management
        </p>
        <Link
          href={`/admin/${project.slug}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            !activePage || activePage === 'dashboard'
              ? 'bg-[#ede9fe] text-[#5b5ce2]'
              : 'text-[#374151] hover:bg-[#f9fafb]'
          }`}
        >
          <span>📊</span>
          Dashboard
        </Link>
        <Link
          href={`/admin/${project.slug}/pages`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            activePage === 'manage-pages'
              ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
              : 'text-[#374151] hover:bg-[#f9fafb]'
          }`}
        >
          <span>📄</span>
          Manage Pages
        </Link>
        <Link
          href={`/admin/${project.slug}/users`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            activePage === 'users'
              ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
              : 'text-[#374151] hover:bg-[#f9fafb]'
          }`}
        >
          <span>👥</span>
          Manage Users
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
  )
}
