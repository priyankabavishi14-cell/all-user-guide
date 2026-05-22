'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, User } from '@/types'
import {
  createSuperAdminUserAction,
  updateSuperAdminUserAction,
  deleteSuperAdminUserAction,
} from './actions'
import { logoutAction } from '@/app/admin/actions'

export type SuperAdminUserRow = {
  id:           string
  name:         string
  email:        string
  role:         'admin' | 'viewer'
  accessType:   'full' | 'restricted'
  projectId:    string
  projectTitle: string
  projectSlug:  string
  createdAt:    string
}

type Toast = { message: string; type: 'success' | 'error' }

function fieldCls(hasError: boolean) {
  const base =
    'w-full h-10 px-3 rounded-lg border text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition-all'
  return hasError
    ? `${base} border-[#ef4444] focus:ring-2 focus:ring-red-100`
    : `${base} border-[#e5e7eb] focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe]`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function SuperAdminUsersClient({
  users: initialUsers,
  projects,
  user,
}: {
  users:    SuperAdminUserRow[]
  projects: Project[]
  user:     User
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
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

  const [users, setUsers] = useState(initialUsers)
  useEffect(() => setUsers(initialUsers), [initialUsers])

  // Search
  const [search, setSearch] = useState('')
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  // Modal
  const [modalOpen, setModalOpen]       = useState(false)
  const [editUser, setEditUser]         = useState<SuperAdminUserRow | null>(null)
  const [formError, setFormError]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Toast
  const [toast, setToast] = useState<Toast | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function openCreate() {
    setEditUser(null)
    setFormError('')
    setShowPassword(false)
    setModalOpen(true)
  }

  function openEdit(u: SuperAdminUserRow) {
    setEditUser(u)
    setFormError('')
    setShowPassword(false)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditUser(null)
    setFormError('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = editUser
        ? await updateSuperAdminUserAction(editUser.id, formData)
        : await createSuperAdminUserAction(formData)

      if (result.error) {
        setFormError(result.error)
        return
      }
      if (result.success) {
        setToast({
          message: editUser ? 'User updated successfully!' : 'User created successfully!',
          type: 'success',
        })
        closeModal()
        router.refresh()
      }
    })
  }

  function handleDelete(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setDeleteId(null)
    startTransition(async () => {
      const result = await deleteSuperAdminUserAction(userId)
      if (result.error) {
        setToast({ message: result.error, type: 'error' })
        router.refresh()
      } else {
        setToast({ message: 'User deleted', type: 'success' })
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
                        onClick={() => { setIsDropdownOpen(false); router.push(`/admin/${p.slug}`) }}
                        className="w-full text-left px-3 py-2.5 text-sm text-[#111827] hover:bg-[#f9fafb] flex items-center gap-2 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
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

          {/* ── Mega Menu ── */}
          <nav className="px-4 pb-4">
            <p className="text-xs text-[#6b7280] uppercase font-semibold mb-2 tracking-wide">
              Management
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors"
                >
                  <span className="text-base">🗂️</span>
                  Projects Management
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#5b5ce2] bg-[#ede9fe] transition-colors"
                >
                  <span className="text-base">👥</span>
                  Users Management
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">Users Management</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Manage assistant admin users and their project assignments.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="h-9 px-4 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] hover:brightness-110 transition-all shrink-0"
            >
              + Create User
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full max-w-sm h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe] transition-all"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-[#9ca3af]">
                      {search ? 'No users match your search.' : 'No users created yet.'}
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#111827]">{u.name}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-[#ede9fe] text-[#5b5ce2] font-medium">
                        {u.projectTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                          u.role === 'admin'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-[#6b7280]'
                        }`}
                      >
                        {u.role === 'admin' ? 'Admin User' : 'Normal User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9ca3af] text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {deleteId === u.id ? (
                          <>
                            <span className="text-xs text-[#ef4444] font-medium">Delete?</span>
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={isPending}
                              className="text-xs px-2.5 py-1 rounded-lg bg-[#ef4444] text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(u)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-[#5b5ce2] hover:text-[#5b5ce2] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(u.id)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#ef4444] hover:border-red-300 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <p className="text-xs text-[#9ca3af] mt-3">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
          )}
        </main>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-base font-semibold text-[#111827]">
                {editUser ? 'Edit User' : 'Create User'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#9ca3af] hover:text-[#374151] transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Username <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  name="name"
                  defaultValue={editUser?.name ?? ''}
                  placeholder="Enter username"
                  className={fieldCls(false)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Email <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editUser?.email ?? ''}
                  placeholder="Enter email address"
                  className={fieldCls(false)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Password{' '}
                  {editUser && (
                    <span className="text-[#9ca3af] font-normal">(leave blank to keep current)</span>
                  )}
                  {!editUser && <span className="text-[#ef4444]">*</span>}
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editUser ? 'Leave blank to keep current' : 'Enter password'}
                    className={`${fieldCls(false)} pr-10`}
                    required={!editUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Select Project */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Select Project <span className="text-[#ef4444]">*</span>
                </label>
                <select
                  name="projectId"
                  defaultValue={editUser?.projectId ?? ''}
                  className={`${fieldCls(false)} bg-white`}
                  required
                >
                  <option value="">— Select a project —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-xs text-[#ef4444] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
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
                  {isPending ? 'Saving…' : editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
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
