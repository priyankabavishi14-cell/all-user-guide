'use client'

import { useState, useRef, useEffect } from 'react'
export { SVG_ICONS, isSvgIcon } from '@/lib/icon-utils'
export type { SvgIconName } from '@/lib/icon-utils'
import { SVG_ICONS, isSvgIcon } from '@/lib/icon-utils'

interface Props {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [imgError, setImgError]   = useState(false)
  const ref                       = useRef<HTMLDivElement>(null)
  const searchRef                 = useRef<HTMLInputElement>(null)

  useEffect(() => { setImgError(false) }, [value])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const filtered = query.trim()
    ? SVG_ICONS.filter((name) => name.toLowerCase().includes(query.toLowerCase().trim()))
    : SVG_ICONS

  const label = value
    ? isSvgIcon(value)
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value
    : 'No icon'

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm bg-white hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
      >
        {value && isSvgIcon(value) && !imgError ? (
          <img src={`/icons/${value}.svg`} alt={value} className="w-5 h-5 shrink-0" onError={() => setImgError(true)} />
        ) : value ? (
          <span className="text-base leading-none">{value}</span>
        ) : (
          <span className="w-5 h-5 rounded border border-dashed border-[#d1d5db] shrink-0" />
        )}
        <span className="flex-1 text-left text-[#374151] truncate">{label}</span>
        <svg className="w-4 h-4 text-[#9ca3af] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-3 w-56">
          {/* Search input */}
          <div className="relative mb-2">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af] pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="w-full pl-7 pr-2 py-1.5 text-xs border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
            />
          </div>

          {/* Icon grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto mb-2">
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false) }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                    value === name
                      ? 'border-[#5b5ce2] bg-[#ede9fe]'
                      : 'border-transparent hover:border-[#e5e7eb] hover:bg-[#f9fafb]'
                  }`}
                >
                  <img src={`/icons/${name}.svg`} alt={name} className="w-5 h-5" />
                  <span className="text-[10px] text-[#6b7280] capitalize truncate w-full text-center">{name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9ca3af] text-center py-3 mb-2">No icons match &ldquo;{query}&rdquo;</p>
          )}

          {/* None option */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
              !value
                ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
                : 'text-[#9ca3af] hover:bg-[#f9fafb]'
            }`}
          >
            <span className="w-4 h-4 rounded border border-dashed border-[#d1d5db]" />
            None
          </button>
        </div>
      )}
    </div>
  )
}
