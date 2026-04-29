import { notFound } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatsCards from '@/components/admin/StatsCards';
import RecentPagesTable from '@/components/admin/RecentPagesTable';
import { projects, pages, currentUser, dashboardStats } from '@/lib/mock-data';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const projectPages = pages
    .filter((p) => p.projectId === project.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <AdminHeader project={project} user={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar project={project} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">
              {project.title}
            </p>
            <h1 className="text-2xl font-bold text-[#111827] mt-1">System Overview</h1>
            <p className="text-[#6b7280] text-sm mt-1">
              Manage documentation for selected project
            </p>
            <p className="text-xs text-[#9ca3af] mt-1">Session Active • {now}</p>
          </div>

          <StatsCards
            totalPages={projectPages.length || dashboardStats.totalPages}
            welcomeScreenEnabled={dashboardStats.welcomeScreenEnabled}
            slug={project.slug}
          />

          <RecentPagesTable pages={projectPages} slug={project.slug} />
        </main>
      </div>
    </div>
  );
}
