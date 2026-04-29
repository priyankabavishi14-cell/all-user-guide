import Link from 'next/link';
import type { Page } from '@/types';

interface Props {
  projectSlug: string;
  pages: Page[];
}

export default function FrontendSidebar({ projectSlug, pages }: Props) {
  const rootPages = pages.filter((p) => p.parentId === null);
  const childMap = pages.reduce<Record<string, Page[]>>((acc, page) => {
    if (page.parentId) {
      acc[page.parentId] = [...(acc[page.parentId] ?? []), page];
    }
    return acc;
  }, {});

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#e5e7eb] overflow-y-auto">
      <div className="p-4">
        <p className="text-xs text-[#6b7280] uppercase font-semibold mb-3 tracking-wide">
          Contents
        </p>
        <nav className="flex flex-col gap-0.5">
          {rootPages.map((page) => (
            <div key={page.id}>
              <Link
                href={`/${projectSlug}/pages/${page.slug}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#f3f4f6] transition-colors"
              >
                <span>{page.icon}</span>
                {page.title}
              </Link>
              {(childMap[page.id] ?? []).map((child) => (
                <Link
                  key={child.id}
                  href={`/${projectSlug}/pages/${child.slug}`}
                  className="flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-lg text-sm text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
                >
                  <span>{child.icon}</span>
                  {child.title}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
