import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { projects as mockProjects, pages as mockPages } from '@/lib/mock-data'
import type { Project, Page } from '@/types'
import EditPageEditor from './EditPageEditor'

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ slug: string; pageId: string }>
}) {
  const { slug, pageId } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) redirect('/admin/login')

  let project: Project | undefined
  let page: Page | undefined
  let existingPages: Page[] = []

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: { include: { projects: true } },
      },
    })

    if (!session || session.expires < new Date()) redirect('/admin/login')

    const dbProject = session.user.projects.find((p) => p.slug === slug)
    if (dbProject) {
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

      const dbPages = await prisma.page.findMany({
        where: { projectId: dbProject.id },
        orderBy: { sequence: 'asc' },
      })

      existingPages = dbPages.map((p) => ({
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

      const dbPage = dbPages.find((p) => p.id === pageId)
      if (dbPage) {
        page = existingPages.find((p) => p.id === pageId)
      }
    }
  } catch {
    // DB unavailable — fall back to mock
  }

  if (!project) {
    project = mockProjects.find((p) => p.slug === slug)
    if (!project) notFound()
    existingPages = mockPages.filter((p) => p.projectId === project!.id)
    page = existingPages.find((p) => p.id === pageId)
  }

  if (!page) notFound()

  return <EditPageEditor project={project} page={page} existingPages={existingPages} />
}
