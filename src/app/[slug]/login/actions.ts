'use server'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export type ViewerLoginState = {
  errors?: { email?: string[]; password?: string[] }
  message?: string
}

function verifyPassword(stored: string, input: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = stored.split(':')
    crypto.scrypt(input, salt, 64, (err, derivedKey) => {
      if (err) { reject(err); return }
      try {
        const storedBuf = Buffer.from(hash, 'hex')
        resolve(
          storedBuf.length === derivedKey.length &&
          crypto.timingSafeEqual(storedBuf, derivedKey)
        )
      } catch {
        resolve(false)
      }
    })
  })
}

export async function viewerLoginAction(
  slug: string,
  _prevState: ViewerLoginState,
  formData: FormData
): Promise<ViewerLoginState> {
  const email    = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email)    return { errors: { email: ['Email is required'] } }
  if (!password) return { errors: { password: ['Password is required'] } }

  try {
    const project = await prisma.project.findUnique({ where: { slug } })
    if (!project) return { message: 'Invalid email or password' }

    const projectUser = await prisma.projectUser.findUnique({
      where: { projectId_email: { projectId: project.id, email } },
    })
    if (!projectUser) return { message: 'Invalid email or password' }

    const valid = await verifyPassword(projectUser.password, password)
    if (!valid) return { message: 'Invalid email or password' }

    const token   = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.viewerSession.create({
      data: { sessionToken: token, projectUserId: projectUser.id, expires },
    })

    const cookieStore = await cookies()
    cookieStore.set(`viewer_token_${slug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: `/${slug}`,
    })
  } catch {
    return { message: 'An error occurred. Please try again.' }
  }

  redirect(`/${slug}`)
}
