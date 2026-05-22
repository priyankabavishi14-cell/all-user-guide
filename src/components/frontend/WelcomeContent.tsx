import type { Project } from '@/types';

interface Props {
  project: Project;
}

export default function WelcomeContent({ project }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="text-6xl mb-6">📘</div>
      <h1 className="text-3xl font-bold text-[#111827]">
        Welcome to the {project.title} Guide
      </h1>
      <p className="text-[#6b7280] mt-2 text-base">{project.description}</p>

      <div className="mt-8 w-full max-w-md bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-6 text-left">
        <h2 className="font-semibold text-[#111827] mb-2">Getting Started</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed">
          Use the sidebar on the left to navigate through the available documentation pages.
        </p>
      </div>
    </div>
  );
}
