'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { resolveAuth } from '@/lib/session'

type ActionResult = { success?: boolean; error?: string }

async function verifyProjectAccess(slug: string): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return null
  try {
    const auth = await resolveAuth(token)
    if (!auth) return null
    const project = auth.allProjects.find((p) => p.slug === slug)
    return project?.id ?? null
  } catch {
    return null
  }
}

export async function createReaderTypeAction(
  projectSlug: string,
  formData: FormData
): Promise<ActionResult> {
  const projectId = await verifyProjectAccess(projectSlug)
  if (!projectId) return { error: 'Unauthorized' }

  const name    = formData.get('name')?.toString().trim() ?? ''
  const pageIds = formData.getAll('pageId') as string[]

  if (!name) return { error: 'Name is required' }

  try {
    const readerType = await prisma.readerType.create({
      data: { projectId, name },
    })

    if (pageIds.length > 0) {
      await prisma.readerTypePageSelection.createMany({
        data: pageIds.map((pageId) => ({ readerTypeId: readerType.id, pageId })),
      })
    }

    revalidatePath(`/admin/${projectSlug}/reader-types`)
    return { success: true }
  } catch {
    return { error: 'Failed to create reader type' }
  }
}

export async function updateReaderTypeAction(
  readerTypeId: string,
  projectSlug: string,
  formData: FormData
): Promise<ActionResult> {
  const projectId = await verifyProjectAccess(projectSlug)
  if (!projectId) return { error: 'Unauthorized' }

  const name    = formData.get('name')?.toString().trim() ?? ''
  const pageIds = formData.getAll('pageId') as string[]

  if (!name) return { error: 'Name is required' }

  try {
    await prisma.readerType.update({
      where: { id: readerTypeId },
      data: { name },
    })

    await prisma.readerTypePageSelection.deleteMany({ where: { readerTypeId } })

    if (pageIds.length > 0) {
      await prisma.readerTypePageSelection.createMany({
        data: pageIds.map((pageId) => ({ readerTypeId, pageId })),
      })
    }

    revalidatePath(`/admin/${projectSlug}/reader-types`)
    return { success: true }
  } catch {
    return { error: 'Failed to update reader type' }
  }
}

export async function deleteReaderTypeAction(
  readerTypeId: string,
  projectSlug: string
): Promise<ActionResult> {
  const projectId = await verifyProjectAccess(projectSlug)
  if (!projectId) return { error: 'Unauthorized' }

  try {
    await prisma.readerType.delete({ where: { id: readerTypeId } })
    revalidatePath(`/admin/${projectSlug}/reader-types`)
    return { success: true }
  } catch {
    return { error: 'Failed to delete reader type' }
  }
}
