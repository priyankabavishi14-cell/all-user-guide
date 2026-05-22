import { prisma } from '@/lib/prisma'
import type { User, Project } from '@/types'

export type AdminAuth = {
  kind: 'admin'
  user: User
  allProjects: Project[]
}

export type ViewerAuth = {
  kind: 'viewer'
  user: User
  allProjects: Project[]
  projectUserId: string
  role: 'admin' | 'viewer'
  accessType: 'full' | 'restricted'
  allowedPageIds: string[]
}

export type Auth = AdminAuth | ViewerAuth

function mapProject(p: {
  id: string
  title: string
  slug: string
  description: string | null
  frontendUrl: string | null
  backendUrl: string | null
  isActive: boolean
  welcomeScreenEnabled: boolean
  createdBy: string
  createdAt: Date
}): Project {
  return {
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
  }
}

export async function resolveAuth(token: string): Promise<Auth | null> {
  // Try regular admin session first
  const adminSession = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: { include: { projects: { orderBy: { createdAt: 'desc' } } } },
    },
  })

  if (adminSession && adminSession.expires > new Date()) {
    const u = adminSession.user
    const allProjects = u.projects.map(mapProject)

    // Super admin fetches all projects
    let projects = allProjects
    if (u.isSuperAdmin) {
      const all = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
      projects = all.map(mapProject)
    }

    return {
      kind: 'admin',
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? '',
        isSuperAdmin: u.isSuperAdmin,
        createdAt: u.createdAt.toISOString(),
      },
      allProjects: projects,
    }
  }

  // Try viewer session (ProjectUser)
  const viewerSession = await prisma.viewerSession.findUnique({
    where: { sessionToken: token },
    include: {
      projectUser: { include: { project: true, pagePermissions: true } },
    },
  })

  if (viewerSession && viewerSession.expires > new Date()) {
    const pu = viewerSession.projectUser
    const project = mapProject(pu.project)

    return {
      kind: 'viewer',
      user: {
        id: pu.id,
        name: pu.name,
        email: pu.email,
        phone: '',
        isSuperAdmin: false,
        createdAt: pu.createdAt.toISOString(),
      },
      allProjects: [project],
      projectUserId: pu.id,
      role: pu.role as 'admin' | 'viewer',
      accessType: pu.accessType as 'full' | 'restricted',
      allowedPageIds: pu.pagePermissions.map((pp: { pageId: string }) => pp.pageId),
    }
  }

  return null
}
