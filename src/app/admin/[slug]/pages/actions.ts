'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface DeletePageState {
  error?: string
  success?: boolean
}

export async function deletePageAction(
  pageId: string,
  projectSlug: string
): Promise<DeletePageState> {
  try {
    const childCount = await prisma.page.count({ where: { parentId: pageId } })
    if (childCount > 0) {
      return {
        error: `Cannot delete: this page has ${childCount} sub-page${childCount > 1 ? 's' : ''}. Remove or reassign them first.`,
      }
    }

    await prisma.page.delete({ where: { id: pageId } })
    revalidatePath(`/admin/${projectSlug}`)
    revalidatePath(`/admin/${projectSlug}/pages`)
    return { success: true }
  } catch {
    return { error: 'Failed to delete page. Please try again.' }
  }
}
