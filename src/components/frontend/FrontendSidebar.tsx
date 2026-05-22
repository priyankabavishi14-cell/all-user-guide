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
    <aside className="w-60 shrink-0 bg-white border-r border-[#e5e7eb] overflow-y-auto h-full">
      <div className="p-4">
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
                <div className="flex items-center gap-1">
                  <Link
                    href={pageHref(page.slug)}
                    onClick={onNavigate}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
                        : 'text-[#374151] hover:bg-[#f3f4f6]'
                    }`}
                  >
                    {page.icon
                      ? <PageIcon value={page.icon} className="w-4 h-4 shrink-0" />
                      : <span className="shrink-0">📄</span>
                    }
                    <span className="truncate">{page.title}</span>
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(page.id)}
                      className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#5b5ce2] hover:bg-[#f3f4f6] transition-colors shrink-0 text-xs"
                      aria-label={expanded.has(page.id) ? 'Collapse' : 'Expand'}
                    >
                      {expanded.has(page.id) ? '▾' : '▸'}
                    </button>
                  )}
                </div>

                {hasChildren && expanded.has(page.id) && (
                  <div className="ml-2 mt-0.5 flex flex-col gap-0.5">
                    {children.map((child) => {
                      const isChildActive = child.slug === activePageSlug
                      return (
                        <Link
                          key={child.id}
                          href={pageHref(child.slug)}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-lg text-sm transition-colors ${
                            isChildActive
                              ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
                              : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]'
                          }`}
                        >
                          {child.icon
                            ? <PageIcon value={child.icon} className="w-4 h-4 shrink-0" />
                            : <span className="shrink-0 text-xs">📄</span>
                          }
                          <span className="truncate">{child.title}</span>
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
