import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Accept either admin or viewer session
    const [adminSession, viewerSession] = await Promise.all([
      prisma.session.findUnique({ where: { sessionToken: token }, select: { expires: true } }),
      prisma.viewerSession.findUnique({ where: { sessionToken: token }, select: { expires: true } }),
    ])

    const valid =
      (adminSession && adminSession.expires > new Date()) ||
      (viewerSession && viewerSession.expires > new Date())

    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { pageId?: string; title?: string; content?: string }
    const { pageId, title, content } = body

    if (!pageId) {
      return NextResponse.json({ error: 'pageId is required' }, { status: 400 })
    }

    await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(typeof title === 'string' ? { title: title.trim() || undefined } : {}),
        ...(typeof content === 'string' ? { content } : {}),
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Autosave failed' }, { status: 500 })
  }
}
