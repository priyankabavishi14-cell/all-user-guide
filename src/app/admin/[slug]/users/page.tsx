import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { projects as mockProjects, pages as mockPages, currentUser as mockUser } from '@/lib/mock-data'
import type { Project, Page, User, ProjectUser } from '@/types'
import UsersClient from './UsersClient'

export default async function ManageUsersPage({
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
  let projectUsers: ProjectUser[] = []

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: { include: { projects: { orderBy: { createdAt: 'desc' } } } },
      },
    })

    if (!session || session.expires < new Date()) redirect('/admin/login')

    user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone ?? '',
      isSuperAdmin: session.user.isSuperAdmin,
      createdAt: session.user.createdAt.toISOString(),
    }

    allProjects = session.user.projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description ?? '',
      frontendUrl: p.frontendUrl ?? '',
      backendUrl: p.backendUrl ?? '',
      isActive: p.isActive,
      welcomeScreenEnabled: p.welcomeScreenEnabled,
      createdBy: p.createdBy,
      createdAt: p.createdAt.toISOString(),
    }))

    const dbProject = session.user.projects.find((p) => p.slug === slug)
    if (dbProject) {
      project = allProjects.find((p) => p.slug === slug)

      const [dbPages, dbUsers] = await Promise.all([
        prisma.page.findMany({
          where: { projectId: dbProject.id },
          orderBy: [{ sequence: 'asc' }, { title: 'asc' }],
        }),
        prisma.projectUser.findMany({
          where: { projectId: dbProject.id },
          include: { pagePermissions: true },
          orderBy: { createdAt: 'desc' },
        }),
      ])

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

      projectUsers = dbUsers.map((u) => ({
        id: u.id,
        projectId: u.projectId,
        name: u.name,
        email: u.email,
        role: u.role as 'admin' | 'viewer',
        accessType: u.accessType as 'full' | 'restricted',
        createdAt: u.createdAt.toISOString(),
        allowedPageIds: u.pagePermissions.map((pp) => pp.pageId),
      }))
    }
  } catch {
    // DB unavailable — fall back to mock
  }

  if (!project) {
    project = mockProjects.find((p) => p.slug === slug)
    if (!project) notFound()
    pages = mockPages.filter((p) => p.projectId === project!.id)
  }

  return (
    <UsersClient
      project={project}
      allProjects={allProjects}
      user={user}
      pages={pages}
      projectUsers={projectUsers}
    />
  )
}
