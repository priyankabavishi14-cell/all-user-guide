'use client'

import React, { useState, useMemo, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { deletePageAction } from './actions'
import type { Project, Page, User } from '@/types'

interface Props {
  project: Project
  allProjects: Project[]
  user: User
  pages: Page[]
}

type PageNode = Page & { children: PageNode[] }

function buildTree(pages: Page[]): PageNode[] {
  const map = new Map<string, PageNode>()
  pages.forEach((p) => map.set(p.id, { ...p, children: [] }))
  const roots: PageNode[] = []
  pages.forEach((p) => {
    const node = map.get(p.id)!
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  function sortLevel(nodes: PageNode[]) {
    nodes.sort((a, b) => a.sequence - b.sequence || a.title.localeCompare(b.title))
    nodes.forEach((n) => sortLevel(n.children))
  }
  sortLevel(roots)
  return roots
}

function formatUpdated(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
  })
}

export default function ManagePagesClient({ project, allProjects, user, pages }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [hierarchyView, setHierarchyView] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pageMap = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages])

  useEffect(() => {
    if (hierarchyView) {
      const parentIds = new Set(
        pages.filter((p) => p.parentId !== null).map((p) => p.parentId!)
      )
      setExpanded(parentIds)
    }
  }, [hierarchyView, pages])

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages
    const q = search.toLowerCase()
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }, [pages, search])

  const tree = useMemo(() => buildTree(pages), [pages])

  const flatList = useMemo(
    () =>
      [...filteredPages].sort(
        (a, b) => a.sequence - b.sequence || a.title.localeCompare(b.title)
      ),
    [filteredPages]
  )

  function handleDeleteConfirm() {
    if (!deleteConfirm) return
    const { id, title } = deleteConfirm
    startTransition(async () => {
      const result = await deletePageAction(id, project.slug)
      setDeleteConfirm(null)
      if (result.success) {
        showToast(`"${title}" deleted successfully`, 'success')
        router.refresh()
      } else {
        showToast(result.error ?? 'Failed to delete page', 'error')
      }
    })
  }

  function renderRow(page: Page, depth: number, hasChildren: boolean): React.ReactElement {
    const parentPage = page.parentId ? pageMap.get(page.parentId) : undefined
    return (
      <tr
        key={page.id}
        className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors"
      >
        <td className="py-3 pr-4" style={{ paddingLeft: `${depth * 24 + 16}px` }}>
          <div className="flex items-start gap-2">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(page.id)}
                className="mt-0.5 text-[#9ca3af] hover:text-[#5b5ce2] transition-colors shrink-0 w-4 text-xs"
              >
                {expanded.has(page.id) ? '▾' : '▸'}
              </button>
            ) : depth > 0 ? (
              <span className="w-4 shrink-0 text-[#d1d5db] mt-0.5 text-xs">└</span>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{page.icon || '📄'}</span>
                <span className="font-medium text-[#111827] text-sm">{page.title}</span>
              </div>
              {page.description && (
                <p className="text-xs text-[#6b7280] mt-0.5 truncate max-w-xs">
                  {page.description}
                </p>
              )}
            </div>
          </div>
        </td>

        <td className="py-3 px-2 text-center">
          <span className="inline-block text-xs font-medium text-[#6b7280] bg-[#f3f4f6] rounded px-2 py-0.5">
            {page.sequence}
          </span>
        </td>

        <td className="py-3 px-4">
          <span className="font-mono text-xs bg-[#ede9fe] text-[#5b5ce2] px-2 py-0.5 rounded">
            {page.slug}
          </span>
          {parentPage && (
            <p className="text-xs text-[#9ca3af] mt-0.5">↳ {parentPage.title}</p>
          )}
        </td>

        <td className="py-3 px-4 text-xs text-[#6b7280] whitespace-nowrap">
          {formatUpdated(page.updatedAt)}
        </td>

        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/${project.slug}/pages/${page.id}/edit`}
              className="text-[#5b5ce2] hover:text-[#7c3aed] transition-colors text-sm"
              title="Edit page"
            >
              ✏️
            </Link>
            <button
              onClick={() => setDeleteConfirm({ id: page.id, title: page.title })}
              className="text-[#9ca3af] hover:text-[#ef4444] transition-colors text-sm"
              title="Delete page"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    )
  }

  function renderTreeRows(nodes: PageNode[], depth: number = 0): React.ReactElement[] {
    return nodes.flatMap((node) => {
      const hasChildren = node.children.length > 0
      const rows: React.ReactElement[] = [renderRow(node, depth, hasChildren)]
      if (hasChildren && expanded.has(node.id)) {
        rows.push(...renderTreeRows(node.children, depth + 1))
      }
      return rows
    })
  }

  const useHierarchy = hierarchyView && !search.trim()
  const rowCount = useHierarchy ? pages.length : flatList.length

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <AdminHeader project={project} user={user} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar project={project} allProjects={allProjects} activePage="manage-pages" />
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
                {project.title}
              </p>
              <h1 className="text-2xl font-bold text-[#111827] mt-1">Manage Pages</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Manage, sort, and organize all your guide pages.
              </p>
            </div>
            <Link
              href={`/admin/${project.slug}/pages/new`}
              className="shrink-0 bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Create Page
            </Link>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            {/* Controls */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6] flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-48 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2">
                <span className="text-[#9ca3af] text-sm shrink-0">🔍</span>
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#9ca3af] outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-[#9ca3af] hover:text-[#374151] transition-colors text-xs shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => setHierarchyView((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
                  hierarchyView
                    ? 'bg-[#ede9fe] text-[#5b5ce2] border-[#c4b5fd]'
                    : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f9fafb]'
                }`}
              >
                🌳 Hierarchy View
              </button>

              <span className="text-xs text-[#9ca3af] whitespace-nowrap">
                {rowCount} row{rowCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                    <th className="text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide py-2.5 pl-4 pr-4">
                      Title
                    </th>
                    <th className="text-center text-xs font-semibold text-[#6b7280] uppercase tracking-wide py-2.5 px-2 w-16">
                      Seq
                    </th>
                    <th className="text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide py-2.5 px-4">
                      ID / Parent
                    </th>
                    <th className="text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide py-2.5 px-4">
                      Updated
                    </th>
                    <th className="text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide py-2.5 px-4 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {useHierarchy ? (
                    tree.length > 0 ? (
                      renderTreeRows(tree)
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <p className="text-[#9ca3af] text-sm">No pages created yet.</p>
                          <Link
                            href={`/admin/${project.slug}/pages/new`}
                            className="mt-3 inline-block text-sm text-[#5b5ce2] hover:underline"
                          >
                            Create your first page →
                          </Link>
                        </td>
                      </tr>
                    )
                  ) : flatList.length > 0 ? (
                    flatList.map((p) => renderRow(p, 0, false))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <p className="text-[#9ca3af] text-sm">
                          {search ? 'No pages match your search.' : 'No pages created yet.'}
                        </p>
                        {!search && (
                          <Link
                            href={`/admin/${project.slug}/pages/new`}
                            className="mt-3 inline-block text-sm text-[#5b5ce2] hover:underline"
                          >
                            Create your first page →
                          </Link>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Delete Page</h3>
            <p className="text-sm text-[#6b7280] mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-[#111827]">&quot;{deleteConfirm.title}&quot;</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isPending}
                className="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}
