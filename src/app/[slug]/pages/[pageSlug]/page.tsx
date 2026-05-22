import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import FrontendShell from '@/components/frontend/FrontendShell'
import PageContent from '@/components/frontend/PageContent'
import { projects as mockProjects, pages as mockPages } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import type { Project, Page } from '@/types'

export default async function FrontendPageView({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>
}) {
  const { slug, pageSlug } = await params

  let project: Project | undefined
  let projectPages: Page[] = []
  let activePage: Page | undefined
  let viewerName: string | null = null
  let accessDenied = false

  try {
    const dbProject = await prisma.project.findUnique({
      where: { slug },
      include: {
        pages: {
          where: { isActive: true },
          orderBy: [{ sequence: 'asc' }, { title: 'asc' }],
        },
      },
    })

    if (dbProject && dbProject.isActive) {
      project = {
        id: dbProject.id,
        title: dbProject.title,
        slug: dbProject.slug,
        description: dbProject.description ?? '',
        frontendUrl: dbProject.frontendUrl ?? '',
        backendUrl: dbProject.backendUrl ?? '',
        isActive: dbProject.isActive,
        welcomeScreenEnabled: dbProject.welcomeScreenEnabled,
        createdBy: dbProject.createdBy,
        createdAt: dbProject.createdAt.toISOString(),
      }

      projectPages = dbProject.pages.map((p) => ({
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

      activePage = projectPages.find((p) => p.slug === pageSlug)

      // Permission check: only if users are configured for this project
      const userCount = await prisma.projectUser.count({ where: { projectId: dbProject.id } })
      if (userCount > 0) {
        const cookieStore = await cookies()
        const viewerToken = cookieStore.get(`viewer_token_${slug}`)?.value
        if (!viewerToken) redirect(`/${slug}/login`)

        const viewerSession = await prisma.viewerSession.findUnique({
          where: { sessionToken: viewerToken },
          include: { projectUser: { include: { pagePermissions: true } } },
        })
        if (!viewerSession || viewerSession.expires < new Date()) redirect(`/${slug}/login`)

        const viewer = viewerSession.projectUser
        viewerName = viewer.name

        if (viewer.accessType === 'restricted') {
          const allowedIds = new Set(viewer.pagePermissions.map((pp) => pp.pageId))
          projectPages = projectPages.filter((p) => allowedIds.has(p.id))
          if (activePage && !allowedIds.has(activePage.id)) {
            accessDenied = true
          }
        }
      }
    }
  } catch {
    // DB unavailable — fall back to mock (public access)
  }

  if (!project) {
    const mock = mockProjects.find((p) => p.slug === slug)
    if (!mock) notFound()
    project = mock
    projectPages = mockPages
      .filter((p) => p.projectId === mock.id && p.isActive)
      .sort((a, b) => a.sequence - b.sequence)
    activePage = projectPages.find((p) => p.slug === pageSlug)
  }

  if (!activePage && !accessDenied) notFound()

  const viewerProp = viewerName ? { name: viewerName } : undefined

  if (accessDenied) {
    return (
      <FrontendShell project={project} pages={projectPages} viewer={viewerProp}>
        <div className="flex flex-col items-center justify-center h-full py-24 px-6 text-center">
          <span className="text-5xl mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">Access Denied</h1>
          <p className="text-[#6b7280] text-sm max-w-xs">
            You do not have permission to view this page. Contact your administrator if you need access.
          </p>
        </div>
      </FrontendShell>
    )
  }

  return (
    <FrontendShell project={project} pages={projectPages} activePageSlug={pageSlug} viewer={viewerProp}>
      <PageContent page={activePage!} />
    </FrontendShell>
  )
}
