import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveAuth } from '@/lib/session'
import { projects as mockProjects, pages as mockPages } from '@/lib/mock-data'
import type { Project, Page } from '@/types'
import CreatePageEditor from './CreatePageEditor'

export default async function CreateNewPagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) redirect('/admin/login')

  let project: Project | undefined
  let existingPages: Page[] = []

  try {
    const auth = await resolveAuth(token)
    if (!auth) redirect('/admin/login')

    const dbProject = auth.allProjects.find((p) => p.slug === slug)
    if (dbProject) {
      project = dbProject

      const dbPages = await prisma.page.findMany({
        where: { projectId: dbProject.id },
        orderBy: { sequence: 'asc' },
        select: { id: true, title: true, parentId: true, sequence: true },
      })

      existingPages = dbPages.map((p) => ({
        id: p.id,
        projectId: dbProject.id,
        title: p.title,
        slug: '',
        sequence: p.sequence,
        icon: '',
        parentId: p.parentId,
        description: '',
        content: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      }))
    }
  } catch {
    // DB unavailable — fall back to mock
  }

  if (!project) {
    project = mockProjects.find((p) => p.slug === slug)
    if (!project) notFound()
    existingPages = mockPages.filter((p) => p.projectId === project!.id)
  }

  return <CreatePageEditor project={project} existingPages={existingPages} />
}
