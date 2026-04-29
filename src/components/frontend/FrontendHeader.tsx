import type { Project } from '@/types';

interface Props {
  project: Project;
}

export default function FrontendHeader({ project }: Props) {
  return (
    <header className="flex items-center gap-3 px-6 py-3 bg-white border-b border-[#e5e7eb] shrink-0">
      <span className="font-bold text-[#5b5ce2]">GuideManager</span>
      <span className="bg-[#ede9fe] text-[#5b5ce2] text-xs px-3 py-1 rounded-full font-medium">
        {project.title}
      </span>
    </header>
  );
}
