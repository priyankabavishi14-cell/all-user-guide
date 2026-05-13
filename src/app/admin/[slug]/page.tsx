import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import StatsCards from '@/components/admin/StatsCards'
import RecentPagesTable from '@/components/admin/RecentPagesTable'
import { projects as mockProjects, pages as mockPages, currentUser as mockUser } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import { resolveAuth } from '@/lib/session'
import type { Project, Page, User } from '@/types'

export default async function AdminDashboardPage({
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
  let projectPages: Page[] = []
  let user: User = mockUser

  try {
    const auth = await resolveAuth(token)
    if (!auth) redirect('/admin/login')

    user = auth.user
    allProjects = auth.allProjects

    const dbProject = auth.allProjects.find((p) => p.slug === slug)
    if (dbProject) {
      project = dbProject

      const dbPages = await prisma.page.findMany({
        where: { projectId: dbProject.id },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      })

      projectPages = dbPages.map((p) => ({
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
    // DB unavailable — fall back to mock data
  }

  // Fall back to mock if project wasn't resolved from DB
  if (!project) {
    project = mockProjects.find((p) => p.slug === slug)
    if (!project) notFound()
    projectPages = mockPages
      .filter((p) => p.projectId === project!.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
  }

  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      <AdminHeader project={project} user={user} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar project={project} allProjects={allProjects} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
              {project.title} Project
            </p>
            <h1 className="text-2xl font-bold text-[#111827] mt-1">System Overview</h1>
            <p className="text-[#6b7280] text-sm mt-1">
              Manage documentation for {project.slug} from this console.
            </p>
            <p className="text-xs text-[#9ca3af] mt-1">Session Active • {now}</p>
          </div>

          <StatsCards
            totalPages={projectPages.length}
            welcomeScreenEnabled={project.welcomeScreenEnabled}
            projectId={project.id}
            slug={project.slug}
          />

          <RecentPagesTable pages={projectPages} slug={project.slug} />
        </main>
      </div>
    </div>
  )
}
