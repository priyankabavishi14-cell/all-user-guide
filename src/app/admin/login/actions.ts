'use server'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string
}

function verifyPassword(stored: string, input: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = stored.split(':')
    crypto.scrypt(input, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      try {
        const storedBuf = Buffer.from(hash, 'hex')
        const inputBuf = derivedKey
        resolve(
          storedBuf.length === inputBuf.length &&
            crypto.timingSafeEqual(storedBuf, inputBuf)
        )
      } catch {
        resolve(false)
      }
    })
  })
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const errors: LoginState['errors'] = {}

  if (!email) {
    errors.email = ['Email is required']
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Please enter a valid email address']
  }

  if (!password) errors.password = ['Password is required']

  if (Object.keys(errors).length > 0) return { errors }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.password) {
    return { message: 'Invalid email or password' }
  }

  const valid = await verifyPassword(user.password, password)
  if (!valid) {
    return { message: 'Invalid email or password' }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: { sessionToken: token, userId: user.id, expires },
  })

  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  })

  redirect('/admin')
}
