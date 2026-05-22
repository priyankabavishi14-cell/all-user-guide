import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveAuth } from '@/lib/session'
import { projects as mockProjects, pages as mockPages, currentUser as mockUser } from '@/lib/mock-data'
import type { Project, Page, User } from '@/types'
import ManagePagesClient from './ManagePagesClient'

export default async function ManagePagesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) redirect('/admin/login')

  let project: Project | undefined
  let allProjects: Project[] = mockProjects
  let pages: Page[] = []
  let user: User = mockUser
  let viewerRole: 'admin' | 'viewer' | undefined
  let allowedPageIds: string[] | undefined

  try {
    const auth = await resolveAuth(token)
    if (!auth) redirect('/admin/login')

    user = auth.user
    allProjects = auth.allProjects
    if (auth.kind === 'viewer') {
      viewerRole = auth.role
      if (auth.accessType === 'restricted') allowedPageIds = auth.allowedPageIds
    }

    const dbProject = auth.allProjects.find((p) => p.slug === slug)
    if (dbProject) {
      project = dbProject

      const whereClause = allowedPageIds
        ? { projectId: dbProject.id, id: { in: allowedPageIds } }
        : { projectId: dbProject.id }

      const dbPages = await prisma.page.findMany({
        where: whereClause,
        orderBy: [{ sequence: 'asc' }, { title: 'asc' }],
      })

      pages = dbPages.map((p) => ({
        id: p.id,
        projectId: p.projectId,
        title: p.title,
        slug: p.slug,
        sequence: p.sequence,
        icon: p.icon ?? '',
        parentId: p.parentId,
        description: p.description ?? '',
        content: p.content ?? '',
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    }
  } catch {
    // DB unavailable — fall back to mock
  }

  if (!project) {
    project = mockProjects.find((p) => p.slug === slug)
    if (!project) notFound()
    pages = mockPages
      .filter((p) => p.projectId === project!.id)
      .sort((a, b) => a.sequence - b.sequence)
  }

  return (
    <ManagePagesClient
      project={project}
      allProjects={allProjects}
      user={user}
      pages={pages}
      viewerRole={viewerRole}
    />
  )
}
