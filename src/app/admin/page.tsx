import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { projects as mockProjects, currentUser as mockUser } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import type { Project, User } from '@/types'
import ProjectsDashboard from './ProjectsDashboard'

export default async function AllProjectsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) redirect('/admin/login')

  let projectsList: Project[] = mockProjects
  let user: User = mockUser

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: { projects: { orderBy: { createdAt: 'desc' } } },
        },
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

    const rawProjects = user.isSuperAdmin
      ? await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
      : session.user.projects

    projectsList = rawProjects.map((p) => ({
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
  } catch {
    // DB unavailable — fall back to mock data
  }

  return <ProjectsDashboard initialProjects={projectsList} user={user} />
}
