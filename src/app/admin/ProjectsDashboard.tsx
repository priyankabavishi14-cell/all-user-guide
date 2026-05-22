'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, User } from '@/types'
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  toggleProjectAction,
  logoutAction,
  type ProjectFormState,
} from './actions'

type Toast = { message: string; type: 'success' | 'error' }

function fieldCls(hasError: boolean) {
  const base =
    'w-full h-10 px-3 rounded-lg border text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition-all'
  return hasError
    ? `${base} border-[#ef4444] focus:ring-2 focus:ring-red-100`
    : `${base} border-[#e5e7eb] focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe]`
}

export default function ProjectsDashboard({
  initialProjects,
  user,
}: {
  initialProjects: Project[]
  user: User
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Switch Project dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Project list
  const [projects, setProjects] = useState(initialProjects)
  useEffect(() => setProjects(initialProjects), [initialProjects])

  // Search
  const [search, setSearch] = useState('')
  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [formErrors, setFormErrors] = useState<ProjectFormState['errors']>({})
  const [formMessage, setFormMessage] = useState('')
  const [slugValue, setSlugValue] = useState('')

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Toast
  const [toast, setToast] = useState<Toast | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function openCreateModal() {
    setEditProject(null)
    setSlugValue('')
    setFormErrors({})
    setFormMessage('')
    setModalOpen(true)
  }

  function openEditModal(project: Project) {
    setEditProject(project)
    setSlugValue(project.slug)
    setFormErrors({})
    setFormMessage('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditProject(null)
    setSlugValue('')
    setFormErrors({})
    setFormMessage('')
    formRef.current?.reset()
  }

  function handleFormSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = editProject
        ? await updateProjectAction(editProject.id, formData)
        : await createProjectAction(formData)

      if (result.errors) {
        setFormErrors(result.errors)
        setFormMessage('')
        return
      }
      if (result.message) {
        setFormMessage(result.message)
        setFormErrors({})
        return
      }
      if (result.success) {
        setToast({
          message: editProject ? 'Project updated!' : 'Project created!',
          type: 'success',
        })
        closeModal()
        router.refresh()
      }
    })
  }

  function handleDelete(projectId: string) {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    setDeleteConfirmId(null)

    startTransition(async () => {
      const result = await deleteProjectAction(projectId)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        router.refresh()
      } else {
        setToast({ message: 'Project deleted', type: 'success' })
      }
    })
  }

  function handleToggle(projectId: string, isActive: boolean) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isActive: !isActive } : p))
    )

    startTransition(async () => {
      const result = await toggleProjectAction(projectId, isActive)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        router.refresh()
      } else {
        setToast({
          message: isActive ? 'Project deactivated' : 'Project activated',
          type: 'success',
        })
      }
    })
  }

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white border-b border-[#e5e7eb] shrink-0">
        <span className="font-bold text-[#5b5ce2] text-base">AdminConsole</span>

        <div className="flex items-center gap-3">
          {user.isSuperAdmin && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white font-semibold">
              Super Admin
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5ce2] to-[#7c3aed] flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[#111827] leading-none">{user.name}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{user.email}</p>
            </div>
          </div>

          <form action={logoutAction} suppressHydrationWarning>
            <button
              type="submit"
              suppressHydrationWarning
              className="text-sm text-[#6b7280] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:text-[#ef4444] hover:border-red-200 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-60 shrink-0 bg-white border-r border-[#e5e7eb] flex-col sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto hidden md:flex">
          <div className="p-4">
            <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
              Switch Project
            </p>

            {/* Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2 hover:border-[#5b5ce2] transition-colors"
              >
                <span className="text-sm text-[#9ca3af] truncate">Select Project</span>
                <span className="text-[#6b7280] text-xs ml-1 shrink-0">
                  {isDropdownOpen ? '▴' : '▾'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-md z-10 overflow-hidden">
                  {projects.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-[#9ca3af]">No projects yet</p>
                  ) : (
                    projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push(`/admin/${p.slug}`)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-[#111827] hover:bg-[#f9fafb] flex items-center gap-2 transition-colors"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            p.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="truncate">{p.title}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              href="/admin"
              className="block mt-2 text-xs text-[#5b5ce2] font-semibold text-center bg-[#ede9fe] rounded-lg px-2 py-1.5 hover:bg-[#ddd6fe] transition-colors"
            >
              Manage All Projects
            </Link>
          </div>

          {/* ── Super Admin Mega Menu ── */}
          {user.isSuperAdmin && (
            <nav className="px-4 pb-4">
              <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
                Management
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#5b5ce2] bg-[#ede9fe] transition-colors"
                  >
                    <span className="text-base">🗂️</span>
                    Projects Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors"
                  >
                    <span className="text-base">👥</span>
                    Users Management
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111827]">Project Management</h1>
            <p className="text-[#6b7280] text-sm mt-1">
              Create and manage documentation scopes for different product URLs.
            </p>
          </div>

          {/* ── Toolbar: Create button + Search ── */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={openCreateModal}
              className="shrink-0 h-9 px-4 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all"
            >
              + Create New Project
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="flex-1 h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe] transition-all"
            />
          </div>

          {/* ── Project listing ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-[#111827]">Existing Projects</h2>
              <span className="text-xs font-normal text-[#6b7280]">({filtered.length})</span>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-[#e5e7eb] px-6 py-12 text-center">
                  <p className="text-[#6b7280] text-sm">
                    {search ? 'No projects match your search.' : 'No projects yet. Create your first project →'}
                  </p>
                </div>
              )}

              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Project info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#111827] text-sm">{project.title}</p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                            project.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-[#6b7280]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              project.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          {project.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-0.5">{project.slug}.guide</p>
                      {project.description && (
                        <p className="text-xs text-[#9ca3af] mt-1 truncate max-w-sm">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {deleteConfirmId === project.id ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#ef4444] font-medium">Delete?</span>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={isPending}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        <Link
                          href={`/admin/${project.slug}`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white hover:brightness-110 transition-all"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openEditModal(project)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(project.id, project.isActive)}
                          disabled={isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            project.isActive
                              ? 'border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]'
                              : 'border-green-200 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {project.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#ef4444] hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#111827]">
                {editProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#6b7280] hover:text-[#111827] transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {formMessage && (
              <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formMessage}
              </div>
            )}

            <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Project Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="My Project"
                  defaultValue={editProject?.title ?? ''}
                  key={`title-${editProject?.id ?? 'new'}`}
                  className={fieldCls(!!formErrors?.title)}
                />
                {formErrors?.title && (
                  <p className="mt-1 text-xs text-[#ef4444]">{formErrors.title[0]}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Slug *
                </label>
                <input
                  name="slug"
                  type="text"
                  required
                  placeholder="my-project"
                  value={slugValue}
                  onChange={(e) =>
                    setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  className={fieldCls(!!formErrors?.slug)}
                />
                {slugValue && (
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Preview: <span className="font-medium">{slugValue}.guide</span>
                  </p>
                )}
                {formErrors?.slug && (
                  <p className="mt-1 text-xs text-[#ef4444]">{formErrors.slug[0]}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Short description..."
                  defaultValue={editProject?.description ?? ''}
                  key={`desc-${editProject?.id ?? 'new'}`}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe] transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-lg border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-lg text-white font-semibold text-sm
                    bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed]
                    hover:brightness-110 transition-all
                    disabled:opacity-70 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {editProject ? 'Saving...' : 'Creating...'}
                    </>
                  ) : editProject ? (
                    'Save Changes'
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white z-50 ${
            toast.type === 'success' ? 'bg-[#5b5ce2]' : 'bg-[#ef4444]'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
