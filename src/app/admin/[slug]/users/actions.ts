'use server'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

type ActionResult = { success?: boolean; error?: string }

async function verifyAdminSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: { include: { projects: true } } },
  })
  if (!session || session.expires < new Date()) return null
  return session
}

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

export async function createProjectUserAction(
  projectSlug: string,
  formData: FormData
): Promise<ActionResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return { error: 'Unauthorized' }

  const adminSession = await verifyAdminSession(token)
  if (!adminSession) return { error: 'Unauthorized' }

  const dbProject = adminSession.user.projects.find((p) => p.slug === projectSlug)
  if (!dbProject) return { error: 'Project not found' }

  const name       = formData.get('name')?.toString().trim() ?? ''
  const email      = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password   = formData.get('password')?.toString() ?? ''
  const role       = formData.get('role')?.toString() ?? 'viewer'
  const accessType = formData.get('accessType')?.toString() ?? 'full'
  const pageIds    = formData.getAll('pageId') as string[]

  if (!name)                         return { error: 'Name is required' }
  if (!email)                        return { error: 'Email is required' }
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters' }

  try {
    const hashedPassword = await hashPassword(password)
    const projectUser = await prisma.projectUser.create({
      data: { projectId: dbProject.id, name, email, password: hashedPassword, role, accessType },
    })

    if (accessType === 'restricted' && pageIds.length > 0) {
      await prisma.pagePermission.createMany({
        data: pageIds.map((pageId) => ({ projectUserId: projectUser.id, pageId })),
      })
    }

    revalidatePath(`/admin/${projectSlug}/users`)
    return { success: true }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return { error: 'A user with this email already exists' }
    return { error: 'Failed to create user' }
  }
}

export async function updateProjectUserAction(
  userId: string,
  projectSlug: string,
  formData: FormData
): Promise<ActionResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return { error: 'Unauthorized' }

  const adminSession = await verifyAdminSession(token)
  if (!adminSession) return { error: 'Unauthorized' }

  const name       = formData.get('name')?.toString().trim() ?? ''
  const email      = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password   = formData.get('password')?.toString() ?? ''
  const role       = formData.get('role')?.toString() ?? 'viewer'
  const accessType = formData.get('accessType')?.toString() ?? 'full'
  const pageIds    = formData.getAll('pageId') as string[]

  if (!name)                return { error: 'Name is required' }
  if (!email)               return { error: 'Email is required' }
  if (password && password.length < 6) return { error: 'Password must be at least 6 characters' }

  try {
    type UpdateData = { name: string; email: string; role: string; accessType: string; password?: string }
    const updateData: UpdateData = { name, email, role, accessType }
    if (password) updateData.password = await hashPassword(password)

    await prisma.projectUser.update({ where: { id: userId }, data: updateData })
    await prisma.pagePermission.deleteMany({ where: { projectUserId: userId } })

    if (accessType === 'restricted' && pageIds.length > 0) {
      await prisma.pagePermission.createMany({
        data: pageIds.map((pageId) => ({ projectUserId: userId, pageId })),
      })
    }

    revalidatePath(`/admin/${projectSlug}/users`)
    return { success: true }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return { error: 'A user with this email already exists' }
    return { error: 'Failed to update user' }
  }
}

export async function deleteProjectUserAction(
  userId: string,
  projectSlug: string
): Promise<ActionResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return { error: 'Unauthorized' }

  const adminSession = await verifyAdminSession(token)
  if (!adminSession) return { error: 'Unauthorized' }

  try {
    await prisma.projectUser.delete({ where: { id: userId } })
    revalidatePath(`/admin/${projectSlug}/users`)
    return { success: true }
  } catch {
    return { error: 'Failed to delete user' }
  }
}
