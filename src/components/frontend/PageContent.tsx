import { renderMarkdown } from '@/lib/render-markdown'
import PageIcon from '@/components/PageIcon'
import type { Page } from '@/types'

interface Props {
  page: Page
}

export default function PageContent({ page }: Props) {
  const html = renderMarkdown(page.content || '')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {page.icon && <PageIcon value={page.icon} className="w-8 h-8 shrink-0" />}
          <h1 className="text-3xl font-bold text-[#111827]">{page.title}</h1>
        </div>
        {page.description && (
          <p className="text-[#6b7280] text-base leading-relaxed">{page.description}</p>
        )}
        <div className="mt-4 h-px bg-[#e5e7eb]" />
      </div>

      {page.content ? (
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="text-center py-16">
          <p className="text-[#9ca3af] text-sm">This page has no content yet.</p>
        </div>
      )}
    </div>
  )
}
