import { notFound } from 'next/navigation';
import FrontendHeader from '@/components/frontend/FrontendHeader';
import FrontendSidebar from '@/components/frontend/FrontendSidebar';
import WelcomeContent from '@/components/frontend/WelcomeContent';
import { projects, pages } from '@/lib/mock-data';

export default async function FrontendHomePage({
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
    .filter((p) => p.projectId === project.id && p.isActive)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <FrontendHeader project={project} />
      <div className="flex flex-1 overflow-hidden">
        <FrontendSidebar projectSlug={project.slug} pages={projectPages} />
        <main className="flex-1 overflow-auto">
          <WelcomeContent project={project} />
        </main>
      </div>
    </div>
  );
}
