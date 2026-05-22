import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { resolveAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { projects as mockProjects, pages as mockPages, currentUser as mockUser } from '@/lib/mock-data'
import type { Project, Page, User, ReaderType } from '@/types'
import ReaderTypeClient from './ReaderTypeClient'

export default async function ReaderTypesPage({
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
  let readerTypes: ReaderType[] = []
  let user: User = mockUser

  try {
    const auth = await resolveAuth(token)
    if (!auth) redirect('/admin/login')

    user = auth.user
    allProjects = auth.allProjects

    const dbProject = auth.allProjects.find((p) => p.slug === slug)
    if (dbProject) {
      project = dbProject

      const [dbPages, dbReaderTypes] = await Promise.all([
        prisma.page.findMany({
          where: { projectId: dbProject.id, isActive: true },
          orderBy: [{ sequence: 'asc' }, { title: 'asc' }],
        }),
        prisma.readerType.findMany({
          where: { projectId: dbProject.id },
          include: { pageSelections: true },
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

      readerTypes = dbReaderTypes.map((rt) => ({
        id: rt.id,
        projectId: rt.projectId,
        name: rt.name,
        token: rt.token,
        pageIds: rt.pageSelections.map((s) => s.pageId),
        createdAt: rt.createdAt.toISOString(),
      }))
    }
  } catch {
    // DB unavailable — fall back to mock
  }

  if (!project) {
    project = mockProjects.find((p) => p.slug === slug)
    if (!project) notFound()
    pages = mockPages
      .filter((p) => p.projectId === project!.id && p.isActive)
      .sort((a, b) => a.sequence - b.sequence)
  }

  return (
    <ReaderTypeClient
      project={project}
      allProjects={allProjects}
      user={user}
      pages={pages}
      readerTypes={readerTypes}
    />
  )
}
