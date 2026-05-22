'use server'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

type ActionResult = { success?: boolean; error?: string }

async function verifySuperAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    if (!token) return false
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    })
    return !!(session && session.expires >= new Date() && session.user.isSuperAdmin)
  } catch {
    return false
  }
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

export async function createSuperAdminUserAction(
  formData: FormData
): Promise<ActionResult> {
  if (!(await verifySuperAdmin())) return { error: 'Unauthorized' }

  const name      = formData.get('name')?.toString().trim() ?? ''
  const email     = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password  = formData.get('password')?.toString() ?? ''
  const projectId = formData.get('projectId')?.toString() ?? ''

  if (!name)                            return { error: 'Username is required' }
  if (!email)                           return { error: 'Email is required' }
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters' }
  if (!projectId)                       return { error: 'Project is required' }

  try {
    const hashedPassword = await hashPassword(password)
    await prisma.projectUser.create({
      data: {
        projectId,
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        accessType: 'full',
      },
    })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002')
      return { error: 'A user with this email already exists in this project' }
    return { error: 'Failed to create user' }
  }
}

export async function updateSuperAdminUserAction(
  userId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!(await verifySuperAdmin())) return { error: 'Unauthorized' }

  const name      = formData.get('name')?.toString().trim() ?? ''
  const email     = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password  = formData.get('password')?.toString() ?? ''
  const projectId = formData.get('projectId')?.toString() ?? ''

  if (!name)                              return { error: 'Username is required' }
  if (!email)                             return { error: 'Email is required' }
  if (password && password.length < 6)    return { error: 'Password must be at least 6 characters' }

  try {
    type UpdateData = {
      name: string
      email: string
      projectId?: string
      password?: string
    }
    const updateData: UpdateData = { name, email }
    if (password)   updateData.password  = await hashPassword(password)
    if (projectId)  updateData.projectId = projectId

    await prisma.projectUser.update({ where: { id: userId }, data: updateData })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002')
      return { error: 'A user with this email already exists' }
    return { error: 'Failed to update user' }
  }
}

export async function deleteSuperAdminUserAction(
  userId: string
): Promise<ActionResult> {
  if (!(await verifySuperAdmin())) return { error: 'Unauthorized' }

  try {
    await prisma.projectUser.delete({ where: { id: userId } })
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { error: 'Failed to delete user' }
  }
}
