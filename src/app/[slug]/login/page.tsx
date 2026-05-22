import { notFound } from 'next/navigation'
import { projects as mockProjects } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import ViewerLoginClient from './ViewerLoginClient'

export default async function ViewerLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let projectTitle = ''

  try {
    const project = await prisma.project.findUnique({ where: { slug } })
    if (project) projectTitle = project.title
  } catch {
    const mock = mockProjects.find((p) => p.slug === slug)
    if (mock) projectTitle = mock.title
  }

  if (!projectTitle) {
    const mock = mockProjects.find((p) => p.slug === slug)
    if (!mock) notFound()
    projectTitle = mock.title
  }

  return <ViewerLoginClient slug={slug} projectTitle={projectTitle} />
}
