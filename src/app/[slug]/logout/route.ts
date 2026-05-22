import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cookieName = `viewer_token_${slug}`
  const token = request.cookies.get(cookieName)?.value

  if (token) {
    try {
      await prisma.viewerSession.deleteMany({ where: { sessionToken: token } })
    } catch {
      // DB unavailable — still clear cookie
    }
  }

  const response = NextResponse.redirect(new URL(`/${slug}/login`, request.url))
  response.cookies.delete(cookieName)
  return response
}
