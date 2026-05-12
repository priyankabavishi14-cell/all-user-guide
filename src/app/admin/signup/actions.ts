'use server'

import crypto from 'crypto'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export type SignupState = {
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
  message?: string
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

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get('name')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString().trim() ?? ''
  const phone = formData.get('phone')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const confirmPassword = formData.get('confirmPassword')?.toString() ?? ''

  const errors: SignupState['errors'] = {}

  if (!name) errors.name = ['Full name is required']

  if (!email) {
    errors.email = ['Email is required']
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Please enter a valid email address']
  }

  if (!phone) errors.phone = ['Phone number is required']

  if (!password) {
    errors.password = ['Password is required']
  } else if (password.length < 6) {
    errors.password = ['Password must be at least 6 characters']
  }

  if (!confirmPassword) {
    errors.confirmPassword = ['Please confirm your password']
  } else if (password !== confirmPassword) {
    errors.confirmPassword = ['Passwords do not match']
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  try {
    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: { name, email, phone, password: hashedPassword },
    })
  } catch (err: unknown) {
    const isUniqueViolation =
      err instanceof Error && err.message.includes('Unique constraint')
    return {
      message: isUniqueViolation
        ? 'An account with this email already exists.'
        : 'Something went wrong. Please try again.',
    }
  }

  redirect('/admin/login')
}
