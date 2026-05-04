'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface UpdatePageState {
  error?: string
  fieldErrors?: {
    title?: string
    slug?: string
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

export async function updatePageAction(
  pageId: string,
  projectId: string,
  projectSlug: string,
  _prevState: UpdatePageState,
  formData: FormData
): Promise<UpdatePageState> {
  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const slugRaw = (formData.get('slug') as string | null)?.trim() ?? ''
  const sequenceRaw = formData.get('sequence') as string | null
  const icon = (formData.get('icon') as string | null)?.trim() ?? ''
  const parentId = (formData.get('parentId') as string | null) || null
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const content = (formData.get('content') as string | null)?.trim() ?? ''

  const fieldErrors: UpdatePageState['fieldErrors'] = {}

  if (!title) {
    fieldErrors.title = 'Page title is required'
  }

  const slug = slugRaw || titleToSlug(title) || 'untitled'

  const sequence = sequenceRaw ? parseInt(sequenceRaw, 10) : 0
  if (sequenceRaw && isNaN(sequence)) {
    fieldErrors.sequence = 'Sequence must be a number'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  try {
    // Check slug uniqueness within project, excluding this page
    const conflict = await prisma.page.findFirst({
      where: { projectId, slug, NOT: { id: pageId } },
      select: { id: true },
    })
    if (conflict) {
      return { fieldErrors: { slug: 'This slug is already used by another page' } }
    }

    // Prevent page from being its own parent
    const safeParentId = parentId === pageId ? null : parentId

    await prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        slug,
        sequence,
        icon: icon || null,
        parentId: safeParentId,
        description: description || null,
        content: content || null,
      },
    })

    revalidatePath(`/admin/${projectSlug}`)
    revalidatePath(`/admin/${projectSlug}/pages`)
    revalidatePath(`/${projectSlug}/pages/${slug}`)
    return { success: true }
  } catch {
    return { error: 'Failed to update page. Please try again.' }
  }
}
