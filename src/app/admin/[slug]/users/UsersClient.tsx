'use client'

import React, { useState, useTransition, useRef } from 'react'
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
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#f3f4f6] cursor-pointer"
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
  if (roots.length === 0) {
    return <p className="text-xs text-[#9ca3af] italic py-1">No pages created yet.</p>
  }
  return <div className="space-y-0.5 max-h-48 overflow-y-auto">{roots.map((p) => renderNode(p, 0))}</div>
}

function roleBadge(role: string) {
  const styles: Record<string, string> = {
    editor: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[role] ?? styles.viewer}`}>
      {role}
    </span>
  )
}

function accessBadge(type: string) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        type === 'full' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}
    >
      {type === 'full' ? 'Full' : 'Restricted'}
    </span>
  )
}

export default function UsersClient({ project, allProjects, user, pages, projectUsers: initialUsers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [users, setUsers] = useState<ProjectUser[]>(initialUsers)
  const [editingUser, setEditingUser] = useState<ProjectUser | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formName, setFormName]           = useState('')
  const [formEmail, setFormEmail]         = useState('')
  const [formPassword, setFormPassword]   = useState('')
  const [formRole, setFormRole]           = useState<'editor' | 'viewer'>('viewer')
  const [formAccessType, setFormAccessType] = useState<'full' | 'restricted'>('full')
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set())
  const [formError, setFormError]         = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  function openAddForm() {
    setEditingUser(null)
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormRole('viewer')
    setFormAccessType('full')
    setSelectedPageIds(new Set())
    setFormError('')
    setShowForm(true)
  }

  function openEditForm(u: ProjectUser) {
    setEditingUser(u)
    setFormName(u.name)
    setFormEmail(u.email)
    setFormPassword('')
    setFormRole(u.role)
    setFormAccessType(u.accessType)
    setSelectedPageIds(new Set(u.allowedPageIds))
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingUser(null)
    setFormError('')
  }

  function togglePage(id: string) {
    setSelectedPageIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function buildFormData() {
    const fd = new FormData()
    fd.append('name', formName)
    fd.append('email', formEmail)
    fd.append('password', formPassword)
    fd.append('role', formRole)
    fd.append('accessType', formAccessType)
    if (formAccessType === 'restricted') {
      selectedPageIds.forEach((id) => fd.append('pageId', id))
    }
    return fd
  }

  function handleSubmit() {
    setFormError('')
    startTransition(async () => {
      const fd = buildFormData()
      const result = editingUser
        ? await updateProjectUserAction(editingUser.id, project.slug, fd)
        : await createProjectUserAction(project.slug, fd)

      if (result.error) {
        setFormError(result.error)
        return
      }
      showToast(editingUser ? 'User updated successfully' : 'User created successfully', 'success')
      closeForm()
      router.refresh()
    })
  }

  function handleDeleteConfirm() {
    if (!deleteConfirm) return
    const { id, name } = deleteConfirm
    startTransition(async () => {
      const result = await deleteProjectUserAction(id, project.slug)
      setDeleteConfirm(null)
      if (result.success) {
        showToast(`"${name}" removed successfully`, 'success')
        router.refresh()
      } else {
        showToast(result.error ?? 'Failed to delete user', 'error')
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
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
              onClick={openAddForm}
              className="shrink-0 bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add User
            </button>
          </div>

          <div className={`grid gap-6 ${showForm ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {/* User table */}
            <div className={`bg-white rounded-xl border border-[#e5e7eb] overflow-hidden ${showForm ? 'lg:col-span-2' : ''}`}>
              <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#374151]">
                  {users.length} user{users.length !== 1 ? 's' : ''}
                </span>
                {users.length === 0 && (
                  <span className="text-xs text-[#9ca3af]">
                    When users are added, the live site will require login to view.
                  </span>
                )}
              </div>

              {users.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[#9ca3af] text-sm">No users yet.</p>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    Add a user to restrict documentation access.
                  </p>
                  <button
                    onClick={openAddForm}
                    className="mt-4 text-sm text-[#5b5ce2] hover:underline"
                  >
                    Add your first user →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                        {['Name', 'Email', 'Role', 'Access', 'Actions'].map((h) => (
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
                      {users.map((u) => (
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
                          <td className="py-3 px-4">{roleBadge(u.role)}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              {accessBadge(u.accessType)}
                              {u.accessType === 'restricted' && (
                                <span className="text-xs text-[#9ca3af]">
                                  {u.allowedPageIds.length} page{u.allowedPageIds.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => openEditForm(u)}
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

            {/* Add / Edit form */}
            {showForm && (
              <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 flex flex-col gap-4 h-fit">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#111827]">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-[#9ca3af] hover:text-[#374151] transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Password{' '}
                    {editingUser ? (
                      <span className="font-normal text-[#9ca3af]">(leave blank to keep)</span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? '••••••••' : 'Min. 6 characters'}
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'editor' | 'viewer')}
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition bg-white"
                  >
                    <option value="viewer">Viewer — view pages only</option>
                    <option value="editor">Editor — can create/edit pages</option>
                  </select>
                </div>

                {/* Access type */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">
                    Access Type
                  </label>
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
                        <span className="text-sm capitalize text-[#374151]">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Page permission tree (restricted only) */}
                {formAccessType === 'restricted' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">
                      Allowed Pages
                    </label>
                    <div className="border border-[#e5e7eb] rounded-lg p-2 bg-[#f9fafb]">
                      <PageTree pages={pages} selectedIds={selectedPageIds} onToggle={togglePage} />
                    </div>
                    {selectedPageIds.size === 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        No pages selected — user will see no content.
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isPending
                    ? editingUser ? 'Saving…' : 'Creating…'
                    : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

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
