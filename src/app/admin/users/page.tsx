import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { resolveAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import type { Project } from '@/types'
import SuperAdminUsersClient, { type SuperAdminUserRow } from './SuperAdminUsersClient'

export default async function SuperAdminUsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) redirect('/admin/login')

  try {
    const auth = await resolveAuth(token)
    if (!auth) redirect('/admin/login')
    if (!auth.user.isSuperAdmin) redirect('/admin')

    const [rawUsers, rawProjects] = await Promise.all([
      prisma.projectUser.findMany({
        include: { project: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.findMany({
        where: { isActive: true },
        orderBy: { title: 'asc' },
      }),
    ])

    const users: SuperAdminUserRow[] = rawUsers.map((u) => ({
      id:           u.id,
      name:         u.name,
      email:        u.email,
      role:         u.role as 'admin' | 'viewer',
      accessType:   u.accessType as 'full' | 'restricted',
      projectId:    u.projectId,
      projectTitle: u.project.title,
      projectSlug:  u.project.slug,
      createdAt:    u.createdAt.toISOString(),
    }))

    const projects: Project[] = rawProjects.map((p) => ({
      id:                   p.id,
      title:                p.title,
      slug:                 p.slug,
      description:          p.description ?? '',
      frontendUrl:          p.frontendUrl ?? '',
      backendUrl:           p.backendUrl ?? '',
      isActive:             p.isActive,
      welcomeScreenEnabled: p.welcomeScreenEnabled,
      createdBy:            p.createdBy ?? '',
      createdAt:            p.createdAt.toISOString(),
    }))

    return (
      <SuperAdminUsersClient
        users={users}
        projects={projects}
        user={auth.user}
      />
    )
  } catch {
    redirect('/admin/login')
  }
}
