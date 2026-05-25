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

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function uniqueReaderSlug(projectId: string, base: string, excludeId?: string): Promise<string> {
  let slug = base || 'reader'
  let attempt = 0
  while (true) {
    const existing = await prisma.readerType.findFirst({
      where: { projectId, readerSlug: slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return slug
    attempt++
    slug = `${base}-${attempt}`
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
    const readerSlug = await uniqueReaderSlug(projectId, nameToSlug(name))
    const token = crypto.randomUUID()

    const readerType = await prisma.readerType.create({
      data: { projectId, name, token, readerSlug },
    })

    for (const pageId of pageIds) {
      await prisma.readerTypePageSelection.create({
        data: { readerTypeId: readerType.id, pageId },
      })
    }

    revalidatePath(`/admin/${projectSlug}/reader-types`)
    return { success: true }
  } catch (err) {
    console.error('[createReaderTypeAction]', err)
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
    const readerSlug = await uniqueReaderSlug(projectId, nameToSlug(name), readerTypeId)

    await prisma.readerType.update({
      where: { id: readerTypeId },
      data: { name, readerSlug },
    })

    await prisma.readerTypePageSelection.deleteMany({ where: { readerTypeId } })

    for (const pageId of pageIds) {
      await prisma.readerTypePageSelection.create({
        data: { readerTypeId, pageId },
      })
    }

    revalidatePath(`/admin/${projectSlug}/reader-types`)
    return { success: true }
  } catch (err) {
    console.error('[updateReaderTypeAction]', err)
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
