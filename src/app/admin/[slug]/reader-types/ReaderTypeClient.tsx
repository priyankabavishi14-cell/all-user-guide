'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Project, Page, User, ReaderType } from '@/types'
import {
  createReaderTypeAction,
  updateReaderTypeAction,
  deleteReaderTypeAction,
} from './actions'

type Toast = { message: string; type: 'success' | 'error' }

type PageNode = Page & { children: PageNode[] }

function buildTree(pages: Page[]): PageNode[] {
  const map = new Map<string, PageNode>()
  pages.forEach((p) => map.set(p.id, { ...p, children: [] }))
  const roots: PageNode[] = []
  pages.forEach((p) => {
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(map.get(p.id)!)
    } else {
      roots.push(map.get(p.id)!)
    }
  })
  return roots
}

function PageCheckboxTree({
  nodes,
  selected,
  onToggle,
}: {
  nodes: PageNode[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.id}>
          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors">
            <input
              type="checkbox"
              value={node.id}
              checked={selected.has(node.id)}
              onChange={() => onToggle(node.id)}
              className="w-4 h-4 rounded border-[#d1d5db] accent-[#5b5ce2]"
            />
            <span className="text-sm text-[#111827]">{node.title}</span>
          </label>
          {node.children.length > 0 && (
            <div className="ml-6 border-l border-[#f3f4f6] pl-2">
              <PageCheckboxTree nodes={node.children} selected={selected} onToggle={onToggle} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function SidebarPreview({
  pages,
  selected,
}: {
  pages: Page[]
  selected: Set<string>
}) {
  const visiblePages = pages.filter((p) => selected.has(p.id))
  const tree = buildTree(visiblePages)

  function renderPreviewNodes(nodes: PageNode[], depth = 0) {
    return nodes.map((node) => (
      <li key={node.id}>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {node.icon ? (
            <img src={`/icons/${node.icon}.svg`} alt="" className="w-3.5 h-3.5 opacity-60" />
          ) : (
            <span className="text-[10px]">📄</span>
          )}
          <span className="text-[#374151] truncate">{node.title}</span>
        </div>
        {node.children.length > 0 && (
          <ul>{renderPreviewNodes(node.children, depth + 1)}</ul>
        )}
      </li>
    ))
  }

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#e5e7eb] bg-[#f9fafb]">
        <p className="text-xs font-semibold text-[#6b7280]">Live Site Preview</p>
      </div>
      <div className="p-2 flex-1 overflow-auto">
        {visiblePages.length === 0 ? (
          <p className="text-xs text-[#9ca3af] text-center py-8">
            Select pages to preview the menu
          </p>
        ) : (
          <ul className="space-y-0.5">{renderPreviewNodes(tree)}</ul>
        )}
      </div>
    </div>
  )
}

export default function ReaderTypeClient({
  project,
  allProjects,
  user,
  pages,
  readerTypes: initialReaderTypes,
}: {
  project: Project
  allProjects: Project[]
  user: User
  pages: Page[]
  readerTypes: ReaderType[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const pageTree = buildTree(pages)

  const [readerTypes, setReaderTypes] = useState(initialReaderTypes)
  useEffect(() => setReaderTypes(initialReaderTypes), [initialReaderTypes])

  // Modal
  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<ReaderType | null>(null)
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [formError, setFormError]   = useState('')
  const [copied, setCopied]         = useState<string | null>(null)

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Toast
  const [toast, setToast] = useState<Toast | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function openCreate() {
    setEditItem(null)
    setSelected(new Set())
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(rt: ReaderType) {
    setEditItem(rt)
    setSelected(new Set(rt.pageIds))
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditItem(null)
    setSelected(new Set())
    setFormError('')
  }

  function togglePage(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Sync checkbox state into formData
    selected.forEach((id) => formData.append('pageId', id))

    startTransition(async () => {
      const result = editItem
        ? await updateReaderTypeAction(editItem.id, project.slug, formData)
        : await createReaderTypeAction(project.slug, formData)

      if (result.error) { setFormError(result.error); return }
      if (result.success) {
        setToast({ message: editItem ? 'Reader type updated!' : 'Reader type created!', type: 'success' })
        closeModal()
        router.refresh()
      }
    })
  }

  function handleDelete(id: string) {
    setReaderTypes((prev) => prev.filter((rt) => rt.id !== id))
    setDeleteId(null)
    startTransition(async () => {
      const result = await deleteReaderTypeAction(id, project.slug)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        router.refresh()
      } else {
        setToast({ message: 'Reader type deleted', type: 'success' })
      }
    })
  }

  function getPublishLink(rt: ReaderType) {
    return rt.readerSlug
      ? `/${project.slug}/${rt.readerSlug}`
      : `/${project.slug}/r/${rt.token}`
  }

  function copyLink(rt: ReaderType) {
    const path = rt.readerSlug
      ? `/${project.slug}/${rt.readerSlug}`
      : `/${project.slug}/r/${rt.token}`
    navigator.clipboard.writeText(`${window.location.origin}${path}`).then(() => {
      setCopied(rt.token)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      <AdminHeader project={project} user={user} />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          project={project}
          allProjects={allProjects}
          activePage="reader-types"
        />

        <main className="flex-1 p-6 overflow-auto">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">Reader Type</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Create custom live site links with specific page visibility for different audiences.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="h-9 px-4 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all shrink-0"
            >
              + Create Reader Type
            </button>
          </div>

          {/* Reader types listing */}
          {readerTypes.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e7eb] px-6 py-16 text-center">
              <p className="text-4xl mb-3">🔗</p>
              <p className="text-[#111827] font-semibold text-sm mb-1">No reader types yet</p>
              <p className="text-[#9ca3af] text-xs mb-4">
                Create a reader type to generate a unique publish link with selected pages.
              </p>
              <button
                onClick={openCreate}
                className="h-9 px-4 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all"
              >
                + Create Reader Type
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {readerTypes.map((rt) => {
                const selectedPageTitles = pages
                  .filter((p) => rt.pageIds.includes(p.id))
                  .map((p) => p.title)

                return (
                  <div
                    key={rt.id}
                    className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[#111827] text-sm">{rt.name}</p>
                          <span className="text-xs text-[#9ca3af]">·</span>
                          <span className="text-xs text-[#9ca3af]">{formatDate(rt.createdAt)}</span>
                        </div>

                        {/* Pages badge list */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedPageTitles.length === 0 ? (
                            <span className="text-xs text-[#9ca3af] italic">No pages selected</span>
                          ) : (
                            selectedPageTitles.slice(0, 5).map((title) => (
                              <span
                                key={title}
                                className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151]"
                              >
                                {title}
                              </span>
                            ))
                          )}
                          {selectedPageTitles.length > 5 && (
                            <span className="text-xs text-[#9ca3af]">
                              +{selectedPageTitles.length - 5} more
                            </span>
                          )}
                        </div>

                        {/* Publish link */}
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-[#5b5ce2] bg-[#ede9fe] px-2 py-1 rounded-md truncate max-w-sm">
                            {rt.readerSlug ? `/${project.slug}/${rt.readerSlug}` : `/${project.slug}/r/${rt.token}`}
                          </code>
                          <button
                            onClick={() => copyLink(rt)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-[#5b5ce2] hover:text-[#5b5ce2] transition-colors shrink-0"
                          >
                            {copied === rt.token ? '✓ Copied' : 'Copy Link'}
                          </button>
                          <a
                            href={getPublishLink(rt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-[#5b5ce2] hover:text-[#5b5ce2] transition-colors shrink-0"
                          >
                            Open ↗
                          </a>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {deleteId === rt.id ? (
                          <>
                            <span className="text-xs text-[#ef4444] font-medium">Delete?</span>
                            <button
                              onClick={() => handleDelete(rt.id)}
                              disabled={isPending}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(rt)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-[#5b5ce2] hover:text-[#5b5ce2] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(rt.id)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#ef4444] hover:border-red-300 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] shrink-0">
              <h2 className="text-base font-semibold text-[#111827]">
                {editItem ? 'Edit Reader Type' : 'Create Reader Type'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#9ca3af] hover:text-[#374151] transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Name field */}
              <div className="px-6 pt-4 shrink-0">
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Name <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  name="name"
                  defaultValue={editItem?.name ?? ''}
                  placeholder="e.g. Public Readers, Beta Users..."
                  className="w-full h-10 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe] transition-all"
                  required
                />
              </div>

              {/* Live Site Menu Design */}
              <div className="px-6 pt-4 pb-2 shrink-0">
                <p className="text-xs font-medium text-[#374151]">Live Site Menu Design</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Select pages to include in this reader type's live site menu.
                </p>
              </div>

              {/* Two-column: page selector + preview */}
              <div className="flex gap-4 px-6 pb-4 flex-1 overflow-hidden min-h-0">
                {/* Page selector */}
                <div className="flex-1 min-w-0 border border-[#e5e7eb] rounded-xl overflow-hidden flex flex-col">
                  <div className="px-3 py-2 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between shrink-0">
                    <p className="text-xs font-semibold text-[#6b7280]">Project Pages</p>
                    <span className="text-xs text-[#9ca3af]">{selected.size} selected</span>
                  </div>
                  <div className="p-2 overflow-auto flex-1">
                    {pages.length === 0 ? (
                      <p className="text-xs text-[#9ca3af] text-center py-8">
                        No pages available in this project.
                      </p>
                    ) : (
                      <PageCheckboxTree
                        nodes={pageTree}
                        selected={selected}
                        onToggle={togglePage}
                      />
                    )}
                  </div>
                </div>

                {/* Live preview */}
                <div className="w-52 shrink-0 flex flex-col min-h-0">
                  <SidebarPreview pages={pages} selected={selected} />
                </div>
              </div>

              {formError && (
                <p className="mx-6 mb-3 text-xs text-[#ef4444] bg-red-50 border border-red-100 rounded-lg px-3 py-2 shrink-0">
                  {formError}
                </p>
              )}

              {/* Footer */}
              <div className="flex gap-3 px-6 pb-5 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-lg border border-[#e5e7eb] text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {isPending ? 'Saving…' : editItem ? 'Update' : 'Create Reader Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed]'
              : 'bg-[#ef4444]'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  )
}
