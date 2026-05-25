'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Page } from '@/types'
import PageIcon from '@/components/PageIcon'

interface Props {
  projectSlug: string
  pages: Page[]
  activePageSlug?: string
  readerTypeToken?: string
  readerTypeSlug?: string
  onNavigate?: () => void
}

export default function FrontendSidebar({ projectSlug, pages, activePageSlug, readerTypeToken, readerTypeSlug, onNavigate }: Props) {
  function pageHref(pageSlug: string) {
    if (readerTypeSlug) return `/${projectSlug}/${readerTypeSlug}/pages/${pageSlug}`
    if (readerTypeToken) return `/${projectSlug}/r/${readerTypeToken}/pages/${pageSlug}`
    return `/${projectSlug}/pages/${pageSlug}`
  }
  const rootPages = pages.filter((p) => p.parentId === null)
  const childMap = pages.reduce<Record<string, Page[]>>((acc, page) => {
    if (page.parentId) {
      acc[page.parentId] = [...(acc[page.parentId] ?? []), page]
    }
    return acc
  }, {})

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const activePage = pages.find((p) => p.slug === activePageSlug)
    return activePage?.parentId ? new Set([activePage.parentId]) : new Set()
  })

  useEffect(() => {
    const activePage = pages.find((p) => p.slug === activePageSlug)
    if (activePage?.parentId) {
      setExpanded((prev) => new Set([...prev, activePage.parentId!]))
    }
  }, [activePageSlug, pages])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#e5e7eb] overflow-y-auto h-full flex flex-col">
      <div className="p-4 flex-1">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-3 tracking-wide">
          Contents
        </p>
        <nav className="flex flex-col gap-0.5">
          {rootPages.map((page) => {
            const children = childMap[page.id] ?? []
            const hasChildren = children.length > 0
            const isActive = page.slug === activePageSlug

            return (
              <div key={page.id}>
                <div className={`flex items-center rounded-lg transition-colors ${isActive ? 'bg-[#ede9fe]' : 'hover:bg-[#f3f4f6]'}`}>
                  {/* Expand/collapse toggle — always reserve space for alignment */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(page.id)}
                      className="shrink-0 w-7 h-8 flex items-center justify-center text-[#9ca3af] hover:text-[#5b5ce2] transition-colors"
                      aria-label={expanded.has(page.id) ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded.has(page.id) ? 'rotate-90' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <span className="shrink-0 w-7" />
                  )}
                  <Link
                    href={pageHref(page.slug)}
                    onClick={onNavigate}
                    className={`flex-1 min-w-0 flex items-center gap-2 pr-3 py-2 text-sm font-medium ${
                      isActive ? 'text-[#5b5ce2]' : 'text-[#374151]'
                    }`}
                  >
                    {page.icon
                      ? <PageIcon value={page.icon} className="w-4 h-4 shrink-0" />
                      : <span className="shrink-0 text-base leading-none">📄</span>
                    }
                    <span className="truncate leading-snug">{page.title}</span>
                  </Link>
                </div>

                {hasChildren && expanded.has(page.id) && (
                  <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                    {children.map((child) => {
                      const isChildActive = child.slug === activePageSlug
                      return (
                        <Link
                          key={child.id}
                          href={pageHref(child.slug)}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-lg text-sm transition-colors min-w-0 ${
                            isChildActive
                              ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
                              : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]'
                          }`}
                        >
                          {child.icon
                            ? <PageIcon value={child.icon} className="w-3.5 h-3.5 shrink-0" />
                            : <span className="shrink-0 text-xs leading-none">📄</span>
                          }
                          <span className="truncate leading-snug">{child.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {rootPages.length === 0 && (
            <p className="text-xs text-[#9ca3af] px-3 py-4 text-center">
              No pages published yet.
            </p>
          )}
        </nav>
      </div>
    </aside>
  )
}
