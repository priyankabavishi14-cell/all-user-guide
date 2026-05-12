'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface CreatePageState {
  error?: string
  fieldErrors?: {
    title?: string
    sequence?: string
  }
  success?: boolean
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function createPageAction(
  projectId: string,
  projectSlug: string,
  _prevState: CreatePageState,
  formData: FormData
): Promise<CreatePageState> {
  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const sequenceRaw = formData.get('sequence') as string | null
  const icon = (formData.get('icon') as string | null)?.trim() ?? ''
  const parentId = (formData.get('parentId') as string | null) || null
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const content = (formData.get('content') as string | null)?.trim() ?? ''

  const fieldErrors: CreatePageState['fieldErrors'] = {}

  if (!title) {
    fieldErrors.title = 'Page title is required'
  }

  const sequence = sequenceRaw ? parseInt(sequenceRaw, 10) : 0
  if (sequenceRaw && isNaN(sequence)) {
    fieldErrors.sequence = 'Sequence must be a number'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  try {
    const baseSlug = titleToSlug(title) || 'untitled'

    // Ensure slug is unique within project
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const existing = await prisma.page.findFirst({
        where: { projectId, slug },
        select: { id: true },
      })
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    await prisma.page.create({
      data: {
        projectId,
        title,
        slug,
        sequence,
        icon: icon || null,
        parentId: parentId || null,
        description: description || null,
        content: content || null,
        isActive: true,
      },
    })

    revalidatePath(`/admin/${projectSlug}`)
    revalidatePath(`/admin/${projectSlug}/pages`)
    return { success: true }
  } catch {
    return { error: 'Failed to save page. Please try again.' }
  }
}
