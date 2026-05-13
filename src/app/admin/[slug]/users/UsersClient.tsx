'use client'

import React, { useState, useTransition, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import {
  createProjectUserAction,
  updateProjectUserAction,
  deleteProjectUserAction,
} from './actions'
import type { Project, Page, User, ProjectUser } from '@/types'

interface Props {
  project: Project
  allProjects: Project[]
  user: User
  pages: Page[]
  projectUsers: ProjectUser[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin'
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isAdmin ? 'Admin User' : 'Normal User'}
    </span>
  )
}

function AccessBadge({ type }: { type: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        type === 'full' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}
    >
      {type === 'full' ? 'Full Access' : 'Restricted'}
    </span>
  )
}

function PageTree({
  pages,
  selectedIds,
  onToggle,
}: {
  pages: Page[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  function renderNode(page: Page, depth: number): React.ReactElement {
    const children = pages.filter((p) => p.parentId === page.id)
    return (
      <div key={page.id}>
        <label
          className="flex items-center gap-2 py-1.5 rounded hover:bg-[#f3f4f6] cursor-pointer"
          style={{ paddingLeft: `${8 + depth * 20}px` }}
        >
          <input
            type="checkbox"
            checked={selectedIds.has(page.id)}
            onChange={() => onToggle(page.id)}
            className="accent-[#5b5ce2] rounded"
          />
          <span className="text-sm">{page.icon || '📄'}</span>
          <span className="text-sm text-[#111827] truncate">{page.title}</span>
        </label>
        {children.map((c) => renderNode(c, depth + 1))}
      </div>
    )
  }

  const roots = pages.filter((p) => !p.parentId)
  if (roots.length === 0)
    return <p className="text-xs text-[#9ca3af] italic py-1">No pages created yet.</p>
  return (
    <div className="space-y-0.5 max-h-48 overflow-y-auto">
      {roots.map((p) => renderNode(p, 0))}
    </div>
  )
}

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#374151] mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="font-normal text-[#9ca3af] ml-1">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = (err?: string) =>
  `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
    err ? 'border-red-300 focus:ring-red-200' : 'border-[#e5e7eb]'
  }`

// ── Main component ────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

export default function UsersClient({
  project,
  allProjects,
  user,
  pages,
  projectUsers: initialUsers,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [users, setUsers] = useState<ProjectUser[]>(initialUsers)
  const [search, setSearch] = useState('')

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [activeUser, setActiveUser] = useState<ProjectUser | null>(null)

  // Form fields
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formRole, setFormRole] = useState<'admin' | 'viewer'>('viewer')
  const [formAccessType, setFormAccessType] = useState<'full' | 'restricted'>('full')
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  // ── Search filter ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function resetForm() {
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setShowPassword(false)
    setFormRole('viewer')
    setFormAccessType('full')
    setSelectedPageIds(new Set())
    setFieldErrors({})
    setFormError('')
  }

  function openAdd() {
    resetForm()
    setActiveUser(null)
    setModalMode('add')
  }

  function openEdit(u: ProjectUser) {
    setActiveUser(u)
    setFormName(u.name)
    setFormEmail(u.email)
    setFormPassword('')
    setShowPassword(false)
    setFormRole(u.role)
    setFormAccessType(u.accessType)
    setSelectedPageIds(new Set(u.allowedPageIds))
    setFieldErrors({})
    setFormError('')
    setModalMode('edit')
  }

  function openView(u: ProjectUser) {
    setActiveUser(u)
    setModalMode('view')
  }

  function closeModal() {
    setModalMode(null)
    setActiveUser(null)
    resetForm()
  }

  function togglePage(id: string) {
    setSelectedPageIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Form submit ────────────────────────────────────────────────────────────

  function handleSubmit() {
    setFormError('')
    setFieldErrors({})

    const fd = new FormData()
    fd.append('name', formName)
    fd.append('email', formEmail)
    fd.append('password', formPassword)
    fd.append('role', formRole)
    fd.append('accessType', formAccessType)
    if (formAccessType === 'restricted') {
      selectedPageIds.forEach((id) => fd.append('pageId', id))
    }

    startTransition(async () => {
      const result =
        activeUser
          ? await updateProjectUserAction(activeUser.id, project.slug, fd)
          : await createProjectUserAction(project.slug, fd)

      if (result.error) {
        setFormError(result.error)
        return
      }

      showToast(activeUser ? 'User updated successfully' : 'User created successfully', 'success')
      closeModal()
      router.refresh()
    })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function handleDeleteConfirm() {
    if (!deleteConfirm) return
    const { id, name } = deleteConfirm
    startTransition(async () => {
      const result = await deleteProjectUserAction(id, project.slug)
      setDeleteConfirm(null)
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
        showToast(`"${name}" removed successfully`, 'success')
        router.refresh()
      } else {
        showToast(result.error ?? 'Failed to delete user', 'error')
      }
    })
  }

  // ── Add/Edit modal body ────────────────────────────────────────────────────

  function renderFormModal() {
    const isEdit = modalMode === 'edit'
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
        <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f3f4f6] shrink-0">
            <h2 className="text-base font-semibold text-[#111827]">
              {isEdit ? 'Edit User' : 'Add New User'}
            </h2>
            <button
              onClick={closeModal}
              className="text-[#9ca3af] hover:text-[#374151] transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <Field label="Full Name" required>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className={inputCls(fieldErrors.name)}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </Field>

            <Field label="Email" required>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="jane@example.com"
                className={inputCls(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </Field>

            <Field
              label="Password"
              required={!isEdit}
              hint={isEdit ? '(leave blank to keep current)' : undefined}
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={isEdit ? '••••••••' : 'Min. 6 characters'}
                  className={`${inputCls(fieldErrors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </Field>

            {/* Role */}
            <Field label="Role">
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as 'admin' | 'viewer')}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition bg-white"
              >
                <option value="admin">Admin User — full project access</option>
                <option value="viewer">Normal User — restricted access</option>
              </select>
            </Field>

            {/* Access type */}
            <Field label="Access Type">
              <div className="flex gap-3">
                {(['full', 'restricted'] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                      formAccessType === type
                        ? 'border-[#5b5ce2] bg-[#ede9fe]'
                        : 'border-[#e5e7eb] hover:bg-[#f9fafb]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accessType"
                      value={type}
                      checked={formAccessType === type}
                      onChange={() => setFormAccessType(type)}
                      className="accent-[#5b5ce2]"
                    />
                    <span className="text-sm text-[#374151]">
                      {type === 'full' ? 'Full Access' : 'Restricted'}
                    </span>
                  </label>
                ))}
              </div>
              {formAccessType === 'full' && (
                <p className="mt-1.5 text-xs text-[#6b7280]">
                  User can access all allowed modules for this project.
                </p>
              )}
            </Field>

            {/* Page permissions tree */}
            {formAccessType === 'restricted' && (
              <Field label="Allowed Pages">
                <div className="border border-[#e5e7eb] rounded-lg p-2 bg-[#f9fafb]">
                  <PageTree pages={pages} selectedIds={selectedPageIds} onToggle={togglePage} />
                </div>
                {selectedPageIds.size === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    No pages selected — user will see no content.
                  </p>
                )}
              </Field>
            )}

            {/* Assigned project (read-only display) */}
            <Field label="Assigned Project">
              <div className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-[#6b7280] bg-[#f9fafb]">
                {project.title}
              </div>
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-[#f3f4f6] shrink-0 flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 h-10 rounded-lg border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-10 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── View modal ─────────────────────────────────────────────────────────────

  function renderViewModal() {
    if (!activeUser) return null
    const assignedPages = pages.filter((p) => activeUser.allowedPageIds.includes(p.id))
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
        <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111827]">User Details</h2>
            <button
              onClick={closeModal}
              className="text-[#9ca3af] hover:text-[#374151] transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5b5ce2] to-[#7c3aed] flex items-center justify-center text-white font-semibold shrink-0">
              {activeUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#111827]">{activeUser.name}</p>
              <p className="text-sm text-[#6b7280]">{activeUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#f9fafb] rounded-lg p-3">
              <p className="text-xs text-[#9ca3af] mb-1">Role</p>
              <RoleBadge role={activeUser.role} />
            </div>
            <div className="bg-[#f9fafb] rounded-lg p-3">
              <p className="text-xs text-[#9ca3af] mb-1">Access Type</p>
              <AccessBadge type={activeUser.accessType} />
            </div>
            <div className="bg-[#f9fafb] rounded-lg p-3 col-span-2">
              <p className="text-xs text-[#9ca3af] mb-1">Assigned Project</p>
              <p className="text-sm font-medium text-[#111827]">{project.title}</p>
            </div>
          </div>

          {activeUser.accessType === 'restricted' && (
            <div>
              <p className="text-xs font-semibold text-[#374151] mb-2">
                Allowed Pages ({assignedPages.length})
              </p>
              {assignedPages.length === 0 ? (
                <p className="text-xs text-[#9ca3af] italic">No pages assigned.</p>
              ) : (
                <ul className="space-y-1">
                  {assignedPages.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm text-[#374151]">
                      <span>{p.icon || '📄'}</span>
                      {p.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={closeModal}
              className="flex-1 h-10 rounded-lg border border-[#e5e7eb] text-sm text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => openEdit(activeUser)}
              className="flex-1 h-10 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all"
            >
              Edit User
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      <AdminHeader project={project} user={user} />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar project={project} allProjects={allProjects} activePage="users" />

        <main className="flex-1 p-6 overflow-auto">
          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
                {project.title}
              </p>
              <h1 className="text-2xl font-bold text-[#111827] mt-1">Manage Users</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Control who can access your documentation and what they can see.
              </p>
            </div>
            <button
              onClick={openAdd}
              className="shrink-0 bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add User
            </button>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2 flex-1 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2">
                <span className="text-[#9ca3af] text-sm shrink-0">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
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
              <span className="text-xs text-[#9ca3af] whitespace-nowrap shrink-0">
                {filtered.length} user{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[#9ca3af] text-sm">
                  {search ? 'No users match your search.' : 'No users yet.'}
                </p>
                {!search && (
                  <>
                    <p className="text-xs text-[#9ca3af] mt-1">
                      Add a user to restrict documentation access.
                    </p>
                    <button
                      onClick={openAdd}
                      className="mt-4 text-sm text-[#5b5ce2] hover:underline"
                    >
                      Add your first user →
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                      {['Name', 'Email', 'Role', 'Access Type', 'Assigned Project', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide py-2.5 px-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5b5ce2] to-[#7c3aed] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-[#111827] text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6b7280]">{u.email}</td>
                        <td className="py-3 px-4">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <AccessBadge type={u.accessType} />
                            {u.accessType === 'restricted' && (
                              <span className="text-xs text-[#9ca3af]">
                                {u.allowedPageIds.length} page{u.allowedPageIds.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#374151]">{project.title}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openView(u)}
                              className="text-[#9ca3af] hover:text-[#5b5ce2] transition-colors text-sm"
                              title="View user"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => openEdit(u)}
                              className="text-[#5b5ce2] hover:text-[#7c3aed] transition-colors text-sm"
                              title="Edit user"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ id: u.id, name: u.name })}
                              className="text-[#9ca3af] hover:text-[#ef4444] transition-colors text-sm"
                              title="Delete user"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit modal */}
      {(modalMode === 'add' || modalMode === 'edit') && renderFormModal()}

      {/* View modal */}
      {modalMode === 'view' && renderViewModal()}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Remove User</h3>
            <p className="text-sm text-[#6b7280] mb-6">
              Remove{' '}
              <span className="font-medium text-[#111827]">{deleteConfirm.name}</span>? They will
              lose all access to this project&apos;s documentation.
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
                {isPending ? 'Removing…' : 'Remove'}
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
