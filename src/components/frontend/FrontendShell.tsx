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
  readerTypeSlug?: string
  children: React.ReactNode
}

export default function FrontendShell({ project, pages, activePageSlug, viewer, readerTypeToken, readerTypeSlug, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e7eb] shrink-0 z-30">
        <button
          className="md:hidden p-1.5 rounded-lg text-[#374151] hover:bg-[#f3f4f6] transition-colors shrink-0"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <span className="font-bold text-[#5b5ce2] shrink-0">GuideManager</span>
        <span className="bg-[#ede9fe] text-[#5b5ce2] text-xs px-3 py-1 rounded-full font-medium truncate max-w-[180px] sm:max-w-xs">
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
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out
            md:static md:inset-auto md:z-auto md:translate-x-0 md:flex md:shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ top: 'var(--header-h, 0)' }}
        >
          <FrontendSidebar
            projectSlug={project.slug}
            pages={pages}
            activePageSlug={activePageSlug}
            readerTypeToken={readerTypeToken}
            readerTypeSlug={readerTypeSlug}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
