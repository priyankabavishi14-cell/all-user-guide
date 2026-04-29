import type { Project, User } from '@/types';

interface Props {
  project: Project;
  user: User;
}

export default function AdminHeader({ project, user }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#e5e7eb] shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-[#5b5ce2] shrink-0">AdminConsole</span>
        <span className="text-[#d1d5db] shrink-0">/</span>
        <span className="text-[#374151] font-medium truncate">{project.title}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <a
          href={`http://${project.frontendUrl}`}
          className="hidden sm:inline-flex text-sm text-[#5b5ce2] border border-[#5b5ce2] px-4 py-1.5 rounded-lg hover:bg-[#ede9fe] transition-colors"
        >
          View Live Site
        </a>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5ce2] to-[#7c3aed] flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#111827] leading-none">{user.name}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
