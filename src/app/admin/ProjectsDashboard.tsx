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

  // Project list — synced from server on refresh
  const [projects, setProjects] = useState(initialProjects)
  useEffect(() => setProjects(initialProjects), [initialProjects])

  // Form state
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

  // Populate form when entering edit mode
  useEffect(() => {
    if (editProject) {
      setSlugValue(editProject.slug)
    } else {
      setSlugValue('')
    }
    setFormErrors({})
    setFormMessage('')
  }, [editProject])

  function resetForm() {
    formRef.current?.reset()
    setSlugValue('')
    setFormErrors({})
    setFormMessage('')
    setEditProject(null)
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
        resetForm()
        router.refresh()
      }
    })
  }

  function handleDelete(projectId: string) {
    // Optimistic remove
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    setDeleteConfirmId(null)

    startTransition(async () => {
      const result = await deleteProjectAction(projectId)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        router.refresh() // restore from server
      } else {
        setToast({ message: 'Project deleted', type: 'success' })
      }
    })
  }

  function handleToggle(projectId: string, isActive: boolean) {
    // Optimistic toggle
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isActive: !isActive } : p))
    )

    startTransition(async () => {
      const result = await toggleProjectAction(projectId, isActive)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        router.refresh() // restore from server
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5ce2] to-[#7c3aed] flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[#111827] leading-none">{user.name}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{user.email}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
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
          <div className="p-4 border-b border-[#e5e7eb]">
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

          <nav className="p-4 flex flex-col gap-1 flex-1">
            <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
              Management
            </p>
            <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#d1d5db] text-sm cursor-not-allowed select-none">
              <span>📊</span> Dashboard
            </span>
            <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#d1d5db] text-sm cursor-not-allowed select-none">
              <span>📄</span> Manage Pages
            </span>
          </nav>

          <div className="p-4 border-t border-[#e5e7eb]">
            <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
              Content
            </p>
            <span className="block w-full text-center bg-[#f3f4f6] text-[#9ca3af] px-4 py-2 rounded-lg text-sm cursor-not-allowed select-none">
              + Create New Page
            </span>
            <p className="text-xs text-[#9ca3af] text-center mt-1">Select a project first</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111827]">Project Management</h1>
            <p className="text-[#6b7280] text-sm mt-1">
              Create and manage documentation scopes for different product URLs.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Project listing ── */}
            <section className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-[#111827] mb-3">
                Existing Projects
                <span className="ml-2 text-xs font-normal text-[#6b7280]">
                  ({projects.length})
                </span>
              </h2>

              <div className="space-y-3">
                {projects.length === 0 && (
                  <div className="bg-white rounded-xl border border-[#e5e7eb] px-6 py-12 text-center">
                    <p className="text-[#6b7280] text-sm">
                      No projects yet. Create your first project →
                    </p>
                  </div>
                )}

                {projects.map((project) => (
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
                            className="text-xs px-3 py-1.5 rounded-lg border border-[#5b5ce2] text-[#5b5ce2] hover:bg-[#ede9fe] transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => {
                              setEditProject(project)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
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

            {/* ── Create / Edit form ── */}
            <aside className="w-full lg:w-96 shrink-0">
              <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 sticky top-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-[#111827]">
                    {editProject ? 'Edit Project' : 'New Project'}
                  </h2>
                  {editProject && (
                    <button
                      onClick={resetForm}
                      className="text-xs text-[#6b7280] hover:text-[#111827] transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>

                {formMessage && (
                  <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {formMessage}
                  </div>
                )}

                <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-3">
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
                        setSlugValue(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        )
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
                      rows={2}
                      placeholder="Short description..."
                      defaultValue={editProject?.description ?? ''}
                      key={`desc-${editProject?.id ?? 'new'}`}
                      className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe] transition-all resize-none"
                    />
                  </div>

                  {/* Frontend URL */}
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Frontend URL *
                    </label>
                    <input
                      name="frontendUrl"
                      type="text"
                      required
                      placeholder="project.web.gu"
                      defaultValue={editProject?.frontendUrl ?? ''}
                      key={`fe-${editProject?.id ?? 'new'}`}
                      className={fieldCls(!!formErrors?.frontendUrl)}
                    />
                    {formErrors?.frontendUrl && (
                      <p className="mt-1 text-xs text-[#ef4444]">{formErrors.frontendUrl[0]}</p>
                    )}
                  </div>

                  {/* Backend URL */}
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">
                      Backend URL *
                    </label>
                    <input
                      name="backendUrl"
                      type="text"
                      required
                      placeholder="project.web.ad"
                      defaultValue={editProject?.backendUrl ?? ''}
                      key={`be-${editProject?.id ?? 'new'}`}
                      className={fieldCls(!!formErrors?.backendUrl)}
                    />
                    {formErrors?.backendUrl && (
                      <p className="mt-1 text-xs text-[#ef4444]">{formErrors.backendUrl[0]}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-10 rounded-lg text-white font-semibold text-sm
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
            </aside>
          </div>
        </main>
      </div>

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
