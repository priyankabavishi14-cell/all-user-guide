'use client'

import { useState, useRef, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, Page } from '@/types'
import { createPageAction, type CreatePageState } from './actions'
import IconPicker from '@/components/admin/IconPicker'

interface Props {
  project: Project
  existingPages: Page[]
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

// Build a prefix for a given list type and 0-based line index
function buildListPrefix(type: ListType, idx: number): string {
  if (type === 'bullet')   return '* '
  if (type === 'numbered') return `${idx + 1}. `
  return '- [ ] '
}

// ─── Table helpers ────────────────────────────────────────────────────────────

function isTableLine(line: string): boolean {
  return line.trimStart().startsWith('|')
}

function isSeparatorLine(line: string): boolean {
  return /^\|[\s|:-]+\|$/.test(line.trim())
}

function parseTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
}

function getLineIndex(text: string, pos: number): number {
  return text.slice(0, pos).split('\n').length - 1
}

function findTableBlock(lines: string[], lineIdx: number): { start: number; end: number } | null {
  if (!isTableLine(lines[lineIdx])) return null
  let start = lineIdx
  while (start > 0 && isTableLine(lines[start - 1])) start--
  let end = lineIdx
  while (end < lines.length - 1 && isTableLine(lines[end + 1])) end++
  return { start, end }
}

// ─── Nested list renderer ────────────────────────────────────────────────────

function processLists(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  type Frame = { tag: 'ul' | 'ol'; indent: number }
  const stack: Frame[] = []

  const closeAll = () => { while (stack.length) out.push(`</${stack.pop()!.tag}>`) }
  const closeAbove = (n: number) => {
    while (stack.length && stack[stack.length - 1].indent > n) out.push(`</${stack.pop()!.tag}>`)
  }
  const openList = (tag: 'ul' | 'ol', indent: number) => {
    const isTop = stack.length === 0
    const cls = tag === 'ul'
      ? isTop ? 'list-disc pl-5 my-2' : 'list-disc pl-4 mt-1'
      : isTop ? 'list-decimal pl-5 my-2' : 'list-decimal pl-4 mt-1'
    out.push(`<${tag} class="${cls}">`)
    stack.push({ tag, indent })
  }

  for (const line of lines) {
    const checkedM  = line.match(/^( *)[-*] \[x\] (.+)$/)
    const uncheckM  = line.match(/^( *)[-*] \[ \] (.+)$/)
    const bulletM   = line.match(/^( *)[*-] (?!\[)(.+)$/)
    const numberedM = line.match(/^( *)\d+\. (.+)$/)

    if (checkedM || uncheckM || bulletM || numberedM) {
      const m = (checkedM || uncheckM || bulletM || numberedM)!
      const indent = m[1].length
      const tag: 'ul' | 'ol' = (numberedM && !checkedM && !uncheckM) ? 'ol' : 'ul'
      if (stack.length === 0) {
        openList(tag, indent)
      } else if (indent > stack[stack.length - 1].indent) {
        openList(tag, indent)
      } else if (indent < stack[stack.length - 1].indent) {
        closeAbove(indent)
      }
      if (checkedM) {
        out.push(`<li class="flex items-center gap-2"><span class="text-[#5b5ce2]">☑</span><span class="line-through text-[#9ca3af]">${checkedM[2]}</span></li>`)
      } else if (uncheckM) {
        out.push(`<li class="flex items-center gap-2"><span>☐</span><span>${uncheckM[2]}</span></li>`)
      } else {
        out.push(`<li>${(bulletM || numberedM!)[2]}</li>`)
      }
    } else {
      closeAll()
      out.push(line)
    }
  }
  closeAll()
  return out.join('\n')
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  // Stash <small> before HTML escaping so it survives
  const smallBits: string[] = []
  let html = md.replace(/<small>([\s\S]*?)<\/small>/g, (_m, inner) => {
    smallBits.push(inner)
    return `\x00SMALL${smallBits.length - 1}\x00`
  })

  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_m, code) =>
    `<pre class="bg-gray-100 rounded p-3 text-sm font-mono overflow-x-auto my-3 whitespace-pre-wrap">${code.trim()}</pre>`
  )

  // headings
  html = html
    .replace(/^#{6} (.+)$/gm, '<h6 class="text-sm font-semibold mt-3 mb-1">$1</h6>')
    .replace(/^#{5} (.+)$/gm, '<h5 class="text-sm font-bold mt-3 mb-1">$1</h5>')
    .replace(/^#{4} (.+)$/gm, '<h4 class="text-base font-bold mt-4 mb-1">$1</h4>')
    .replace(/^#{3} (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^#{2} (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')

  // blockquote (line-level)
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="border-l-4 border-[#5b5ce2] pl-3 text-[#6b7280] italic my-2">$1</blockquote>'
  )

  // inline styles (order matters: bold+italic before bold before italic)
  html = html
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/~~(.+?)~~/g,         '<del>$1</del>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/`([^`]+)`/g,         '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    // Images before links
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-3 rounded" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#5b5ce2] underline">$1</a>')

  // nested lists
  html = processLists(html)

  // tables
  {
    const srcLines = html.split('\n')
    const out: string[] = []
    let i = 0
    while (i < srcLines.length) {
      if (isTableLine(srcLines[i])) {
        const tLines: string[] = []
        while (i < srcLines.length && isTableLine(srcLines[i])) { tLines.push(srcLines[i]); i++ }
        const sepIdx = tLines.findIndex(isSeparatorLine)
        if (sepIdx >= 1) {
          const headers  = parseTableRow(tLines[0])
          const dataRows = tLines.slice(sepIdx + 1).map(parseTableRow)
          const thHtml = headers.map(c =>
            `<th class="border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 text-left text-xs font-semibold text-[#374151]">${c}</th>`
          ).join('')
          const tbHtml = dataRows.map(row =>
            `<tr>${row.map(c => `<td class="border border-[#e5e7eb] px-3 py-2 text-xs">${c}</td>`).join('')}</tr>`
          ).join('')
          out.push(`<table class="w-full border-collapse border border-[#e5e7eb] my-3"><thead><tr>${thHtml}</tr></thead><tbody>${tbHtml}</tbody></table>`)
        } else {
          out.push(...tLines)
        }
      } else {
        out.push(srcLines[i]); i++
      }
    }
    html = out.join('\n')
  }

  // horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-t border-[#e5e7eb] my-4" />')

  // paragraphs
  html = html
    .split('\n\n')
    .map((block) => {
      const t = block.trim()
      if (!t) return ''
      if (/^<[h1-6bpldquo]/.test(t) || /<\/(ul|ol|li|table|pre|blockquote|h[1-6])>/.test(t)) return t
      return `<p class="mb-3">${t.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')

  // restore <small>
  html = html.replace(/\x00SMALL(\d+)\x00/g, (_, i) =>
    `<small class="text-xs">${smallBits[parseInt(i)]}</small>`
  )

  return html
}

// ─── Component ────────────────────────────────────────────────────────────────

const AUTOSAVE_KEY = (projectId: string) => `autosave_${projectId}_new`
const AUTOSAVE_DELAY = 1500

export default function CreatePageEditor({ project, existingPages }: Props) {
  const router = useRouter()
  const [viewMode, setViewMode]         = useState<ViewMode>('split')
  const [title, setTitle]               = useState('')
  const [icon, setIcon]                 = useState('')
  const [content, setContent]           = useState('')
  const [activeHeading, setActiveHeading]     = useState<number | null>(null)
  const [activeStyles, setActiveStyles]       = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [inTable, setInTable] = useState(false)

  const [draftLabel, setDraftLabel] = useState('')
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const toastTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef       = useRef<HTMLTextAreaElement>(null)
  const imageInputRef   = useRef<HTMLInputElement>(null)
  const autosaveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isUploading, setIsUploading] = useState(false)

  const draftKey = `page-draft:new:${project.slug}`

  const initialState: CreatePageState = {}
  const boundAction = createPageAction.bind(null, project.id, project.slug)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as { title?: string; icon?: string; content?: string }
      if (draft.title)            setTitle(draft.title)
      if (draft.icon !== undefined) setIcon(draft.icon)
      if (draft.content)          setContent(draft.content)
      setDraftLabel('Draft restored')
      draftLabelTimer.current = setTimeout(() => setDraftLabel(''), 2500)
    } catch {}
  }, [])

  // Autosave debounced 1.5s after any change
  useEffect(() => {
    if (!title && !content) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setAutosaveStatus('saving')
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ title, icon, content }))
        setAutosaveStatus('saved')
        setDraftLabel('Draft saved')
        if (draftLabelTimer.current) clearTimeout(draftLabelTimer.current)
        draftLabelTimer.current = setTimeout(() => { setDraftLabel(''); setAutosaveStatus('idle') }, 2000)
      } catch { setAutosaveStatus('idle') }
    }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [title, icon, content])

  useEffect(() => {
    if (state.success) {
      try { localStorage.removeItem(draftKey) } catch {}
      showToast('success', 'Page created successfully!')
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

  // Upload an image file and insert markdown at cursor
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
          el.focus({ preventScroll: true })
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

  // Apply a list format to selected lines (or current line if no selection)
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

    const delta      = newBlock.length - block.length
    const newCursor  = selectionEnd + delta
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
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
        el.focus({ preventScroll: true })
        const newStart = Math.max(lineStart, selectionStart + (e.shiftKey ? -2 : 2))
        el.setSelectionRange(newStart, Math.max(newStart, selectionEnd + delta))
      })
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const lineStart  = getLineStart(content, selectionStart)
      const lineEnd    = getLineEnd(content, selectionStart)
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
            el.focus({ preventScroll: true })
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
            el.focus({ preventScroll: true })
            el.setSelectionRange(newCursor, newCursor)
          })
        }
      }
    }
  }

  // Sync toolbar active states from current cursor / selection
  function syncToolbarState() {
    const el = editorRef.current
    if (!el) return
    setActiveHeading(detectHeadingLevel(el.value, el.selectionStart))
    setActiveStyles(detectActiveStyles(el.value, el.selectionStart, el.selectionEnd))
    const lines = el.value.split('\n')
    setInTable(!!findTableBlock(lines, getLineIndex(el.value, el.selectionStart)))
  }

  // Apply / remove a heading prefix on the current line
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
      el.focus({ preventScroll: true })
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  // Apply / toggle an inline or line-level text style
  function applyStyle(style: StyleDef) {
    const el = editorRef.current
    if (!el) return

    const { selectionStart: start, selectionEnd: end } = el

    if (style.lineLevel) {
      // Quote: toggle `> ` prefix on the current line
      const lineStart = getLineStart(content, start)
      const lineEnd   = getLineEnd(content, start)
      const line      = content.slice(lineStart, lineEnd)

      let newContent: string
      let newCursor: number
      if (line.startsWith(style.prefix)) {
        // Remove prefix
        newContent = content.slice(0, lineStart) + line.slice(style.prefix.length) + content.slice(lineEnd)
        newCursor  = Math.max(lineStart, start - style.prefix.length)
      } else {
        // Add prefix
        newContent = content.slice(0, lineStart) + style.prefix + line + content.slice(lineEnd)
        newCursor  = start + style.prefix.length
      }
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true })
        el.setSelectionRange(newCursor, newCursor)
      })
      return
    }

    // Inline style
    const selected = content.slice(start, end)
    const before   = content.slice(start - style.prefix.length, start)
    const after    = content.slice(end, end + style.suffix.length)
    const isWrapped = before === style.prefix && after === style.suffix

    if (isWrapped) {
      // Unwrap
      const newContent =
        content.slice(0, start - style.prefix.length) +
        selected +
        content.slice(end + style.suffix.length)
      const newStart = start - style.prefix.length
      const newEnd   = newStart + selected.length
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true })
        el.setSelectionRange(newStart, newEnd)
      })
    } else if (selected) {
      // Wrap selection
      const newContent =
        content.slice(0, start) + style.prefix + selected + style.suffix + content.slice(end)
      const newStart = start + style.prefix.length
      const newEnd   = newStart + selected.length
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true })
        el.setSelectionRange(newStart, newEnd)
      })
    } else {
      // No selection — insert markers and place cursor between them
      const newContent = content.slice(0, start) + style.prefix + style.suffix + content.slice(start)
      const newCursor  = start + style.prefix.length
      setContent(newContent)
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true })
        el.setSelectionRange(newCursor, newCursor)
      })
    }
  }

  function insertTable() {
    const el = editorRef.current
    if (!el) return
    const pos = el.selectionStart
    const tableText = '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |\n'
    const newContent = content.slice(0, pos) + tableText + content.slice(pos)
    setContent(newContent)
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
      el.setSelectionRange(pos + tableText.length, pos + tableText.length)
    })
  }

  function addTableRow() {
    const el = editorRef.current
    if (!el) return
    const lines = content.split('\n')
    const lineIdx = getLineIndex(content, el.selectionStart)
    const block = findTableBlock(lines, lineIdx)
    if (!block) return
    const tLines = lines.slice(block.start, block.end + 1)
    const sepIdx = tLines.findIndex(isSeparatorLine)
    if (sepIdx === -1) return
    const colCount = parseTableRow(tLines[0]).length
    const newRow = '| ' + Array(colCount).fill(' ').join(' | ') + ' |'
    lines.splice(block.end + 1, 0, newRow)
    setContent(lines.join('\n'))
  }

  function removeTableRow() {
    const el = editorRef.current
    if (!el) return
    const lines = content.split('\n')
    const lineIdx = getLineIndex(content, el.selectionStart)
    const block = findTableBlock(lines, lineIdx)
    if (!block) return
    const tLines = lines.slice(block.start, block.end + 1)
    const sepIdx = tLines.findIndex(isSeparatorLine)
    if (sepIdx === -1 || tLines.length - sepIdx - 1 <= 0) return
    lines.splice(block.end, 1)
    setContent(lines.join('\n'))
  }

  function addTableColumn() {
    const el = editorRef.current
    if (!el) return
    const lines = content.split('\n')
    const lineIdx = getLineIndex(content, el.selectionStart)
    const block = findTableBlock(lines, lineIdx)
    if (!block) return
    const tLines = lines.slice(block.start, block.end + 1)
    const sepIdx = tLines.findIndex(isSeparatorLine)
    if (sepIdx === -1) return
    const headerCount = parseTableRow(tLines[0]).length
    const newTLines = tLines.map((line, i) => {
      const cells = parseTableRow(line)
      if (i === sepIdx) cells.push('---')
      else if (i < sepIdx) cells.push(`Header ${headerCount + 1}`)
      else cells.push('')
      return '| ' + cells.join(' | ') + ' |'
    })
    lines.splice(block.start, block.end - block.start + 1, ...newTLines)
    setContent(lines.join('\n'))
  }

  function removeTableColumn() {
    const el = editorRef.current
    if (!el) return
    const lines = content.split('\n')
    const lineIdx = getLineIndex(content, el.selectionStart)
    const block = findTableBlock(lines, lineIdx)
    if (!block) return
    const tLines = lines.slice(block.start, block.end + 1)
    const sepIdx = tLines.findIndex(isSeparatorLine)
    if (sepIdx === -1 || parseTableRow(tLines[0]).length <= 1) return
    const newTLines = tLines.map(line => {
      const cells = parseTableRow(line)
      cells.pop()
      return '| ' + cells.join(' | ') + ' |'
    })
    lines.splice(block.start, block.end - block.start + 1, ...newTLines)
    setContent(lines.join('\n'))
  }

  function insertDivider() {
    const el = editorRef.current
    if (!el) return
    const pos = el.selectionStart
    const dividerText = '\n\n---\n\n'
    const newContent = content.slice(0, pos) + dividerText + content.slice(pos)
    setContent(newContent)
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
      el.setSelectionRange(pos + dividerText.length, pos + dividerText.length)
    })
  }

  const previewHtml = content.trim() ? renderMarkdown(content) : ''

  return (
    <form
      id="create-page-form"
      action={formAction}
      className="h-screen bg-[#f9fafb] flex flex-col"
    >
      <input type="hidden" name="title"   value={title} />
      <input type="hidden" name="icon"    value={icon} />
      <input type="hidden" name="content" value={content} />

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#e5e7eb] shrink-0 shadow-sm">
        {/* Row 1: nav + actions */}
        <div className="h-14 flex items-center px-4 gap-3">
          <Link
            href={`/admin/${project.slug}`}
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

          {draftLabel && (
            <span className="text-xs text-[#9ca3af] hidden sm:inline">{draftLabel}</span>
          )}

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

          {autosaveStatus === 'saved' && (
            <span className="text-xs text-[#6b7280]">Draft saved</span>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Row 2: formatting toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-t border-[#e5e7eb] bg-[#f9fafb] overflow-x-auto">
          {/* Heading buttons */}
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

          {/* List buttons — three separate, always visible */}
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

          {/* Text style buttons */}
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

          {/* Image upload button */}
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

          <span className="w-px h-4 bg-[#e5e7eb] mx-1 shrink-0" />

          {/* Table buttons */}
          <button
            type="button"
            onClick={insertTable}
            title="Insert Table"
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb]"
          >
            ⊞
          </button>
          <button
            type="button"
            onClick={addTableRow}
            title="Add Row"
            disabled={!inTable}
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb] disabled:opacity-40"
          >
            +Row
          </button>
          <button
            type="button"
            onClick={removeTableRow}
            title="Remove Row"
            disabled={!inTable}
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb] disabled:opacity-40"
          >
            -Row
          </button>
          <button
            type="button"
            onClick={addTableColumn}
            title="Add Column"
            disabled={!inTable}
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb] disabled:opacity-40"
          >
            +Col
          </button>
          <button
            type="button"
            onClick={removeTableColumn}
            title="Remove Column"
            disabled={!inTable}
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb] disabled:opacity-40"
          >
            -Col
          </button>

          <span className="w-px h-4 bg-[#e5e7eb] mx-1 shrink-0" />

          {/* Section divider button */}
          <button
            type="button"
            onClick={insertDivider}
            title="Insert Section Divider"
            className="px-2.5 py-1 text-xs rounded transition-colors shrink-0 text-[#374151] hover:bg-[#e5e7eb]"
          >
            ─
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left metadata panel */}
        <aside className="w-[260px] shrink-0 bg-white border-r border-[#e5e7eb] overflow-y-auto flex flex-col gap-4 p-4">
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

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Sequence</label>
            <input
              type="number"
              name="sequence"
              defaultValue={0}
              min={0}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
                state.fieldErrors?.sequence ? 'border-red-400' : 'border-[#e5e7eb]'
              }`}
            />
            {state.fieldErrors?.sequence && (
              <p className="text-red-500 text-xs mt-1">{state.fieldErrors.sequence}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Icon</label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Parent Page</label>
            <select
              name="parentId"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition bg-white"
            >
              <option value="">No Parent (Root)</option>
              {existingPages.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Short Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief summary of this page…"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition resize-none"
            />
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

          {/* Markdown editor */}
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

          {/* Preview panel */}
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
