'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export type ProjectFormState = {
  errors?: {
    title?: string[]
    slug?: string[]
    frontendUrl?: string[]
    backendUrl?: string[]
  }
  message?: string
  success?: boolean
}

async function resolveUserId(): Promise<string> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    if (!token) return 'user-1'
    const session = await prisma.session.findUnique({ where: { sessionToken: token } })
    if (session && session.expires > new Date()) return session.userId
  } catch {}
  return 'user-1'
}

function parseProjectFields(formData: FormData) {
  const title = formData.get('title')?.toString().trim() ?? ''
  const slug = formData.get('slug')?.toString().trim().toLowerCase() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const frontendUrl = formData.get('frontendUrl')?.toString().trim() ?? ''
  const backendUrl = formData.get('backendUrl')?.toString().trim() ?? ''

  const errors: ProjectFormState['errors'] = {}
  if (!title) errors.title = ['Project title is required']
  if (!slug) {
    errors.slug = ['Slug is required']
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = ['Slug may only contain lowercase letters, numbers, and hyphens']
  }
  if (!frontendUrl) errors.frontendUrl = ['Frontend URL is required']
  if (!backendUrl) errors.backendUrl = ['Backend URL is required']

  return { title, slug, description, frontendUrl, backendUrl, errors }
}

export async function createProjectAction(
  formData: FormData
): Promise<ProjectFormState> {
  const { title, slug, description, frontendUrl, backendUrl, errors } =
    parseProjectFields(formData)
  if (Object.keys(errors).length > 0) return { errors }

  const createdBy = await resolveUserId()

  try {
    await prisma.project.create({
      data: { title, slug, description, frontendUrl, backendUrl, createdBy },
    })
  } catch (err: unknown) {
    const isUnique = err instanceof Error && err.message.includes('Unique constraint')
    if (isUnique) return { errors: { slug: ['Slug already exists'] } }
    return { message: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateProjectAction(
  projectId: string,
  formData: FormData
): Promise<ProjectFormState> {
  const { title, slug, description, frontendUrl, backendUrl, errors } =
    parseProjectFields(formData)
  if (Object.keys(errors).length > 0) return { errors }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { title, slug, description, frontendUrl, backendUrl },
    })
  } catch (err: unknown) {
    const isUnique = err instanceof Error && err.message.includes('Unique constraint')
    if (isUnique) return { errors: { slug: ['Slug already exists'] } }
    return { message: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteProjectAction(
  projectId: string
): Promise<{ error?: string }> {
  try {
    await prisma.project.delete({ where: { id: projectId } })
  } catch {
    return { error: 'Failed to delete project' }
  }
  revalidatePath('/admin')
  return {}
}

export async function toggleProjectAction(
  projectId: string,
  isActive: boolean
): Promise<{ error?: string }> {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { isActive: !isActive },
    })
  } catch {
    return { error: 'Failed to update project' }
  }
  revalidatePath('/admin')
  return {}
}

export async function toggleWelcomeScreenAction(
  projectId: string,
  enabled: boolean
): Promise<{ error?: string }> {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { welcomeScreenEnabled: enabled },
    })
  } catch {
    return { error: 'Failed to update welcome screen setting' }
  }
  revalidatePath('/admin')
  return {}
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (token) {
    try {
      await prisma.session.delete({ where: { sessionToken: token } })
    } catch {}
  }
  cookieStore.delete('session_token')
  redirect('/admin/login')
}
