'use client'

import { useState } from 'react'
import FrontendSidebar from './FrontendSidebar'
import type { Project, Page } from '@/types'

interface Props {
  project: Project
  pages: Page[]
  activePageSlug?: string
  viewer?: { name: string }
  readerTypeToken?: string
  children: React.ReactNode
}

export default function FrontendShell({ project, pages, activePageSlug, viewer, readerTypeToken, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e7eb] shrink-0">
        <button
          className="md:hidden p-1 rounded-lg text-[#374151] hover:bg-[#f3f4f6] transition-colors"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-[#5b5ce2]">GuideManager</span>
        <span className="bg-[#ede9fe] text-[#5b5ce2] text-xs px-3 py-1 rounded-full font-medium truncate">
          {project.title}
        </span>
        {viewer && (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="text-sm text-[#374151] hidden sm:inline truncate max-w-[140px]">
              👤 {viewer.name}
            </span>
            <a
              href={`/${project.slug}/logout`}
              className="text-xs text-[#6b7280] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:text-[#ef4444] hover:border-red-200 transition-colors whitespace-nowrap"
            >
              Logout
            </a>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed top-0 left-0 h-full z-20 pt-[53px] transition-transform duration-200
            md:static md:h-full md:pt-0 md:z-auto md:translate-x-0 md:block
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <FrontendSidebar
            projectSlug={project.slug}
            pages={pages}
            activePageSlug={activePageSlug}
            readerTypeToken={readerTypeToken}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
