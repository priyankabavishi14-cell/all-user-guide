'use client'

import { useState, useRef, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, Page } from '@/types'
import { updatePageAction, type UpdatePageState } from './actions'
import IconPicker from '@/components/admin/IconPicker'
import { renderMarkdown } from '@/lib/render-markdown'

interface Props {
  project: Project
  page: Page
  existingPages: Page[]
  availableIcons: string[]
}

type ViewMode = 'editor' | 'preview' | 'split'

// ─── Heading helpers ──────────────────────────────────────────────────────────

const HEADING_LEVELS = [1, 2, 3, 4, 5] as const

function getLineStart(text: string, pos: number): number {
  return text.lastIndexOf('\n', pos - 1) + 1
}

function getLineEnd(text: string, pos: number): number {
  const idx = text.indexOf('\n', pos)
  return idx === -1 ? text.length : idx
}

function detectHeadingLevel(text: string, cursorPos: number): number | null {
  const line = text.slice(getLineStart(text, cursorPos))
  const match = line.match(/^(#{1,5}) /)
  return match ? match[1].length : null
}

// ─── Text style helpers ───────────────────────────────────────────────────────

interface StyleDef {
  key: string
  label: string
  tooltip: string
  prefix: string
  suffix: string
  lineLevel?: boolean
}

const TEXT_STYLES: StyleDef[] = [
  { key: 'bold',          label: 'B',    tooltip: 'Bold',          prefix: '**',       suffix: '**'       },
  { key: 'italic',        label: 'I',    tooltip: 'Italic',        prefix: '*',        suffix: '*'        },
  { key: 'strikethrough', label: 'S',    tooltip: 'Strikethrough', prefix: '~~',       suffix: '~~'       },
  { key: 'code',          label: '</>',  tooltip: 'Inline Code',   prefix: '`',        suffix: '`'        },
  { key: 'small',         label: 'Tt',   tooltip: 'Small Text',    prefix: '<small>',  suffix: '</small>' },
  { key: 'quote',         label: '"',    tooltip: 'Quote',         prefix: '> ',       suffix: '',        lineLevel: true },
]

function detectActiveStyles(
  text: string,
  start: number,
  end: number
): Set<string> {
  const active = new Set<string>()
  for (const s of TEXT_STYLES) {
    if (s.lineLevel) {
      const line = text.slice(getLineStart(text, start))
      if (line.startsWith(s.prefix)) active.add(s.key)
    } else {
      const before = text.slice(start - s.prefix.length, start)
      const after  = text.slice(end, end + s.suffix.length)
      if (before === s.prefix && after === s.suffix) active.add(s.key)
    }
  }
  return active
}

// ─── List helpers ─────────────────────────────────────────────────────────────

type ListType = 'bullet' | 'numbered' | 'checkbox'

const LIST_OPTIONS: { type: ListType; label: string; icon: string }[] = [
  { type: 'bullet',   label: 'Standard List', icon: '•' },
  { type: 'numbered', label: 'Numbered List',  icon: '1.' },
  { type: 'checkbox', label: 'Checkbox List',  icon: '☐' },
]

// Strip list marker from a line while preserving leading indentation
function stripListPrefix(line: string): string {
  return line
    .replace(/^(\s*)\d+\.\s+/, '$1')
    .replace(/^(\s*)[-*]\s+\[[ x]\]\s+/, '$1')
    .replace(/^(\s*)[-*]\s+/, '$1')
}

function buildListPrefix(type: ListType, idx: number): string {
  if (type === 'bullet')   return '* '
  if (type === 'numbered') return `${idx + 1}. `
  return '- [ ] '
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const AUTOSAVE_DELAY = 1500

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditPageEditor({ project, page, existingPages, availableIcons }: Props) {
  const router = useRouter()
  const [viewMode, setViewMode]         = useState<ViewMode>('split')
  const [title, setTitle]               = useState(page.title)
  const [icon, setIcon]                 = useState(page.icon)
  const [slug, setSlug]                 = useState(page.slug)
  const [slugTouched, setSlugTouched]   = useState(false)
  const [content, setContent]           = useState(page.content)
  const [activeHeading, setActiveHeading]   = useState<number | null>(null)
  const [activeStyles, setActiveStyles]     = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const toastTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autosaveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autosaveHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef       = useRef<HTMLTextAreaElement>(null)
  const imageInputRef   = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)

  const initialState: UpdatePageState = {}
  const boundAction = updatePageAction.bind(null, page.id, project.id, project.slug)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  // Track the initial values to skip autosave on first render
  const initialTitle   = useRef(page.title)
  const initialContent = useRef(page.content)

  // Auto-update slug from title (only when slug hasn't been manually edited)
  useEffect(() => {
    if (!slugTouched) {
      setSlug(titleToSlug(title) || 'untitled')
    }
  }, [title, slugTouched])

  // Debounced API autosave whenever title or content changes from their initial values
  useEffect(() => {
    if (title === initialTitle.current && content === initialContent.current) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      setAutosaveStatus('saving')
      try {
        await fetch('/api/autosave', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: page.id, title, content }),
        })
        setAutosaveStatus('saved')
        if (autosaveHideRef.current) clearTimeout(autosaveHideRef.current)
        autosaveHideRef.current = setTimeout(() => setAutosaveStatus('idle'), 2500)
      } catch {
        setAutosaveStatus('idle')
      }
    }, AUTOSAVE_DELAY)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [title, content, page.id])

  useEffect(() => {
    if (state.success) {
      showToast('success', 'Page updated successfully!')
      const t = setTimeout(() => router.push(`/admin/${project.slug}/pages`), 1200)
      return () => clearTimeout(t)
    } else if (state.error) {
      showToast('error', state.error)
    }
  }, [state])

  function showToast(type: 'success' | 'error', message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  async function handleImageUpload(file: File) {
    setIsUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast('error', data.error ?? 'Upload failed. Please try again.')
        return
      }
      const altText = file.name.replace(/\.[^.]+$/, '')
      const syntax  = `![${altText}](${data.url})`
      const el = editorRef.current
      if (el) {
        const pos     = el.selectionStart
        const updated = content.slice(0, pos) + syntax + content.slice(pos)
        setContent(updated)
        const newCursor = pos + syntax.length
        requestAnimationFrame(() => {
          el.focus()
          el.setSelectionRange(newCursor, newCursor)
        })
      } else {
        setContent((prev) => prev + syntax)
      }
    } finally {
      setIsUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  function applyList(type: ListType) {
    const el = editorRef.current
    if (!el) return

    const { selectionStart, selectionEnd } = el
    const lineStart = getLineStart(content, selectionStart)
    const lineEnd   = getLineEnd(content, selectionEnd)
    const block     = content.slice(lineStart, lineEnd)
    const lines     = block.split('\n')

    let lineIdx = 0
    const newLines = lines.map((line) => {
      const stripped = stripListPrefix(line)
      const indent   = stripped.match(/^(\s*)/)?.[1] ?? ''
      const bare     = stripped.slice(indent.length)
      const prefix   = buildListPrefix(type, lineIdx++)
      return indent + prefix + bare
    })

    const newBlock   = newLines.join('\n')
    const newContent = content.slice(0, lineStart) + newBlock + content.slice(lineEnd)
    setContent(newContent)

    const delta     = newBlock.length - block.length
    const newCursor = selectionEnd + delta
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  // Tab = indent list item by 2 spaces; Shift+Tab = dedent; Enter = continue list
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = editorRef.current
    if (!el) return
    const { selectionStart, selectionEnd } = el

    if (e.key === 'Tab') {
      e.preventDefault()
      const lineStart = getLineStart(content, selectionStart)
      const lineEnd   = getLineEnd(content, selectionEnd)
      const block     = content.slice(lineStart, lineEnd)
      const lines     = block.split('\n')

      const newLines = lines.map(line => {
        if (e.shiftKey) {
          return line.startsWith('  ') ? line.slice(2) : line
        }
        return '  ' + line
      })
      const newBlock   = newLines.join('\n')
      const delta      = newBlock.length - block.length
      const newContent = content.slice(0, lineStart) + newBlock + content.slice(lineEnd)
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus()
        const newStart = Math.max(lineStart, selectionStart + (e.shiftKey ? -2 : 2))
        el.setSelectionRange(newStart, Math.max(newStart, selectionEnd + delta))
      })
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const lineStart   = getLineStart(content, selectionStart)
      const lineEnd     = getLineEnd(content, selectionStart)
      const currentLine = content.slice(lineStart, lineEnd)

      const bulletMatch   = currentLine.match(/^(\s*)[*\-] (?!\[[ x]\])/)
      const numberedMatch = currentLine.match(/^(\s*)(\d+)\. /)

      if (bulletMatch || numberedMatch) {
        const markerEnd   = bulletMatch ? bulletMatch[0].length : numberedMatch![0].length
        const lineContent = currentLine.slice(markerEnd)

        if (!lineContent.trim()) {
          // Empty list item — exit the list
          e.preventDefault()
          const newContent = content.slice(0, lineStart) + content.slice(lineEnd)
          setContent(newContent)
          requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(lineStart, lineStart)
          })
        } else if (selectionEnd === lineEnd) {
          // Cursor at end of non-empty list line — continue the list
          e.preventDefault()
          let newPrefix: string
          if (bulletMatch) {
            const marker = currentLine[bulletMatch[1].length]
            newPrefix = bulletMatch[1] + marker + ' '
          } else {
            newPrefix = numberedMatch![1] + (parseInt(numberedMatch![2]) + 1) + '. '
          }
          const insertion  = '\n' + newPrefix
          const newContent = content.slice(0, selectionEnd) + insertion + content.slice(selectionEnd)
          setContent(newContent)
          const newCursor = selectionEnd + insertion.length
          requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(newCursor, newCursor)
          })
        }
      }
    }
  }

  function syncToolbarState() {
    const el = editorRef.current
    if (!el) return
    setActiveHeading(detectHeadingLevel(el.value, el.selectionStart))
    setActiveStyles(detectActiveStyles(el.value, el.selectionStart, el.selectionEnd))
  }

  function applyHeading(level: number) {
    const el = editorRef.current
    if (!el) return

    const { selectionStart } = el
    const lineStart = getLineStart(content, selectionStart)
    const lineEnd   = getLineEnd(content, selectionStart)
    const line      = content.slice(lineStart, lineEnd)

    const existingMatch = line.match(/^(#{1,5}) /)
    const oldPrefixLen  = existingMatch ? existingMatch[0].length : 0
    const lineBody      = line.slice(oldPrefixLen)
    const newPrefix     = '#'.repeat(level) + ' '
    const newContent    = content.slice(0, lineStart) + newPrefix + lineBody + content.slice(lineEnd)

    setContent(newContent)
    setActiveHeading(level)

    const newCursor = Math.max(
      lineStart + newPrefix.length,
      selectionStart + (newPrefix.length - oldPrefixLen)
    )
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  function applyStyle(style: StyleDef) {
    const el = editorRef.current
    if (!el) return

    const { selectionStart: start, selectionEnd: end } = el

    if (style.lineLevel) {
      const lineStart = getLineStart(content, start)
      const lineEnd   = getLineEnd(content, start)
      const line      = content.slice(lineStart, lineEnd)

      let newContent: string
      let newCursor: number
      if (line.startsWith(style.prefix)) {
        newContent = content.slice(0, lineStart) + line.slice(style.prefix.length) + content.slice(lineEnd)
        newCursor  = Math.max(lineStart, start - style.prefix.length)
      } else {
        newContent = content.slice(0, lineStart) + style.prefix + line + content.slice(lineEnd)
        newCursor  = start + style.prefix.length
      }
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(newCursor, newCursor)
      })
      return
    }

    const selected  = content.slice(start, end)
    const before    = content.slice(start - style.prefix.length, start)
    const after     = content.slice(end, end + style.suffix.length)
    const isWrapped = before === style.prefix && after === style.suffix

    if (isWrapped) {
      const newContent =
        content.slice(0, start - style.prefix.length) +
        selected +
        content.slice(end + style.suffix.length)
      const newStart = start - style.prefix.length
      const newEnd   = newStart + selected.length
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(newStart, newEnd)
      })
    } else if (selected) {
      const newContent =
        content.slice(0, start) + style.prefix + selected + style.suffix + content.slice(end)
      const newStart = start + style.prefix.length
      const newEnd   = newStart + selected.length
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(newStart, newEnd)
      })
    } else {
      const newContent = content.slice(0, start) + style.prefix + style.suffix + content.slice(start)
      const newCursor  = start + style.prefix.length
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(newCursor, newCursor)
      })
    }
  }

  const previewHtml = content.trim() ? renderMarkdown(content) : ''

  // Pages available as parents (exclude self and its descendants to avoid cycles)
  const parentOptions = existingPages.filter((p) => p.id !== page.id)

  return (
    <form
      id="edit-page-form"
      action={formAction}
      className="h-screen bg-[#f9fafb] flex flex-col"
    >
      <input type="hidden" name="title"   value={title} />
      <input type="hidden" name="icon"    value={icon} />
      <input type="hidden" name="slug"    value={slug} />
      <input type="hidden" name="content" value={content} />

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#e5e7eb] shrink-0 shadow-sm">
        {/* Row 1: nav + actions */}
        <div className="h-14 flex items-center px-4 gap-3">
          <Link
            href={`/admin/${project.slug}/pages`}
            className="text-[#6b7280] hover:text-[#111827] transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </Link>
          <span className="text-[#e5e7eb]">|</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] hidden sm:inline">
            {project.title}
          </span>
          <span className="text-[#e5e7eb] hidden sm:inline">|</span>
          <span className="text-sm font-semibold text-[#111827] truncate max-w-[180px]">
            {title.trim() || 'Untitled Page'}
          </span>

          <div className="flex-1" />

          {/* View mode */}
          <div className="flex bg-[#f3f4f6] rounded-lg p-0.5 text-xs font-medium">
            {(['editor', 'preview', 'split'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {autosaveStatus === 'saving' && (
            <span className="text-xs text-[#6b7280]">Saving…</span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="text-xs text-[#6b7280]">Saved</span>
          )}

          <Link
            href={`/admin/${project.slug}/pages`}
            className="ml-2 px-4 py-2 text-sm font-medium text-[#374151] border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending ? 'Saving…' : 'Save / Update'}
          </button>
        </div>

        {/* Row 2: formatting toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-t border-[#e5e7eb] bg-[#f9fafb] overflow-x-auto">
          {HEADING_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => applyHeading(level)}
              title={`Heading ${level}`}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors shrink-0 ${
                activeHeading === level
                  ? 'bg-[#5b5ce2] text-white'
                  : 'text-[#374151] hover:bg-[#e5e7eb]'
              }`}
            >
              H{level}
            </button>
          ))}

          <span className="w-px h-4 bg-[#e5e7eb] mx-1 shrink-0" />

          {LIST_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => applyList(opt.type)}
              title={opt.label}
              className="px-2.5 py-1 text-xs font-bold rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb]"
            >
              {opt.icon}
            </button>
          ))}

          <span className="w-px h-4 bg-[#e5e7eb] mx-1 shrink-0" />

          {TEXT_STYLES.map((style) => (
            <button
              key={style.key}
              type="button"
              onClick={() => applyStyle(style)}
              title={style.tooltip}
              className={`px-2.5 py-1 text-xs rounded transition-colors shrink-0 ${
                style.key === 'bold'          ? 'font-bold'    :
                style.key === 'italic'        ? 'italic'       :
                style.key === 'strikethrough' ? 'line-through' :
                style.key === 'code'          ? 'font-mono'    : ''
              } ${
                activeStyles.has(style.key)
                  ? 'bg-[#5b5ce2] text-white'
                  : 'text-[#374151] hover:bg-[#e5e7eb]'
              }`}
            >
              {style.label}
            </button>
          ))}

          <span className="w-px h-4 bg-[#e5e7eb] mx-1 shrink-0" />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            title="Upload Image"
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb] disabled:opacity-50"
          >
            {isUploading ? '⏳' : '🖼️'}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
            }}
          />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left metadata panel */}
        <aside className="w-[260px] shrink-0 bg-white border-r border-[#e5e7eb] overflow-y-auto flex flex-col gap-4 p-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Getting Started"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
                state.fieldErrors?.title ? 'border-red-400' : 'border-[#e5e7eb]'
              }`}
            />
            {state.fieldErrors?.title && (
              <p className="text-red-500 text-xs mt-1">{state.fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={page.description}
              placeholder="Brief summary of this page…"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition resize-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-')
                )
              }}
              placeholder="e.g. getting-started"
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
                state.fieldErrors?.slug ? 'border-red-400' : 'border-[#e5e7eb]'
              }`}
            />
            {state.fieldErrors?.slug ? (
              <p className="text-red-500 text-xs mt-1">{state.fieldErrors.slug}</p>
            ) : (
              <p className="text-[#9ca3af] text-xs mt-1">Auto-generated · must be unique</p>
            )}
          </div>

          {/* Parent Page */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Parent Page</label>
            <select
              name="parentId"
              defaultValue={page.parentId ?? ''}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition bg-white"
            >
              <option value="">No Parent (Root)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Sequence */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Sequence</label>
            <input
              type="number"
              name="sequence"
              defaultValue={page.sequence}
              min={0}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
                state.fieldErrors?.sequence ? 'border-red-400' : 'border-[#e5e7eb]'
              }`}
            />
            {state.fieldErrors?.sequence && (
              <p className="text-red-500 text-xs mt-1">{state.fieldErrors.sequence}</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Icon</label>
            <IconPicker value={icon} onChange={setIcon} icons={availableIcons} />
          </div>

          <div className="bg-[#f0f0ff] border border-[#c7c7f5] rounded-lg p-3 text-xs text-[#5b5ce2] leading-relaxed">
            <p className="font-semibold mb-1">Markdown Tips</p>
            <p>
              Use <code className="bg-white px-1 rounded">#</code> for Header 1,{' '}
              <code className="bg-white px-1 rounded">##</code> for Header 2, and{' '}
              <code className="bg-white px-1 rounded">[Title](URL)</code> for links.
            </p>
          </div>
        </aside>

        {/* Editor + Preview */}
        <div className="flex flex-1 overflow-hidden">

          {(viewMode === 'editor' || viewMode === 'split') && (
            <div
              className={`flex flex-col overflow-hidden ${
                viewMode === 'split' ? 'flex-1 border-r border-[#e5e7eb]' : 'flex-1'
              }`}
            >
              <div className="px-4 py-2 bg-[#f9fafb] border-b border-[#e5e7eb] text-xs font-semibold text-[#6b7280] uppercase tracking-wide shrink-0">
                Editor
              </div>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); syncToolbarState() }}
                onKeyDown={handleKeyDown}
                onKeyUp={syncToolbarState}
                onClick={syncToolbarState}
                placeholder="# Start writing your awesome guide content here..."
                className="flex-1 resize-none p-4 text-sm font-mono text-[#111827] bg-white focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-2 bg-[#f9fafb] border-b border-[#e5e7eb] text-xs font-semibold text-[#6b7280] uppercase tracking-wide shrink-0">
                Preview
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {previewHtml ? (
                  <article
                    className="text-sm text-[#111827]"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#9ca3af] text-sm">Nothing to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed]'
              : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </form>
  )
}
