import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { projects as mockProjects, currentUser as mockUser } from '@/lib/mock-data'
import { resolveAuth } from '@/lib/session'
import type { Project, User } from '@/types'
import ProjectsDashboard from './ProjectsDashboard'

export default async function AllProjectsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) redirect('/admin/login')

  let projectsList: Project[] = mockProjects
  let user: User = mockUser

  try {
    const auth = await resolveAuth(token)
    if (!auth) redirect('/admin/login')

    user = auth.user
    projectsList = auth.allProjects
  } catch {
    // DB unavailable — fall back to mock data
  }

  return <ProjectsDashboard initialProjects={projectsList} user={user} />
}
