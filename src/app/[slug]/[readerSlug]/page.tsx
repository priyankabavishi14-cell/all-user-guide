import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import FrontendShell from '@/components/frontend/FrontendShell'
import WelcomeContent from '@/components/frontend/WelcomeContent'
import type { Project, Page } from '@/types'

export default async function ReaderTypeSlugPage({
  params,
}: {
  params: Promise<{ slug: string; readerSlug: string }>
}) {
  const { slug, readerSlug } = await params

  let project: Project | undefined
  let projectPages: Page[] = []

  try {
    const readerType = await prisma.readerType.findFirst({
      where: { readerSlug, project: { slug } },
      include: {
        project: true,
        pageSelections: { include: { page: true } },
      },
    })

    if (!readerType || !readerType.project.isActive) notFound()

    project = {
      id: readerType.project.id,
      title: readerType.project.title,
      slug: readerType.project.slug,
      description: readerType.project.description ?? '',
      frontendUrl: readerType.project.frontendUrl ?? '',
      backendUrl: readerType.project.backendUrl ?? '',
      isActive: readerType.project.isActive,
      welcomeScreenEnabled: readerType.project.welcomeScreenEnabled,
      createdBy: readerType.project.createdBy,
      createdAt: readerType.project.createdAt.toISOString(),
    }

    projectPages = readerType.pageSelections
      .filter((s) => s.page.isActive)
      .sort((a, b) => a.page.sequence - b.page.sequence)
      .map((s) => ({
        id: s.page.id,
        projectId: s.page.projectId,
        title: s.page.title,
        slug: s.page.slug,
        sequence: s.page.sequence,
        icon: s.page.icon ?? '',
        parentId: s.page.parentId,
        description: s.page.description ?? '',
        content: s.page.content ?? '',
        isActive: s.page.isActive,
        createdAt: s.page.createdAt.toISOString(),
        updatedAt: s.page.updatedAt.toISOString(),
      }))
  } catch {
    notFound()
  }

  if (!project) notFound()

  if (projectPages.length > 0 && !project.welcomeScreenEnabled) {
    redirect(`/${slug}/${readerSlug}/pages/${projectPages[0].slug}`)
  }

  return (
    <FrontendShell project={project} pages={projectPages} readerTypeSlug={readerSlug}>
      <WelcomeContent project={project} />
    </FrontendShell>
  )
}
