import Link from 'next/link'
import type { Page } from '@/types'

interface Props {
  pages: Page[]
  slug: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function RecentPagesTable({ pages, slug }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
        <h3 className="font-semibold text-[#111827]">Recently Updated Pages</h3>
        <Link href={`/admin/${slug}/pages`} className="text-sm text-[#5b5ce2] hover:underline">
          View All →
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-[#6b7280] text-sm">No pages created yet</p>
          <Link
            href={`/admin/${slug}/pages/new`}
            className="inline-block mt-3 text-sm text-white bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Create First Page
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden md:table-cell">
                  Description
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                  Parent
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden sm:table-cell">
                  Last Updated
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-[#f9fafb] transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-[#111827]">{page.title}</td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] hidden md:table-cell max-w-xs">
                    <span className="truncate block">
                      {page.description || <span className="text-[#d1d5db]">—</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280]">
                    {page.parentId ? 'Sub-page' : 'Root'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] hidden sm:table-cell">
                    {formatDate(page.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/${slug}/pages/${page.id}/edit`}
                      className="text-[#5b5ce2] hover:text-[#7c3aed] transition-colors text-base"
                    >
                      ✏️
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
