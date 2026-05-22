'use client'

import { useState, useRef, useEffect } from 'react'
export { SVG_ICONS, isSvgIcon } from '@/lib/icon-utils'
export type { SvgIconName } from '@/lib/icon-utils'
import { SVG_ICONS, isSvgIcon, isLucideIcon, getLucideIconName } from '@/lib/icon-utils'
import { LUCIDE_ICON_MAP, LUCIDE_ICON_NAMES, lucideDisplayName } from '@/lib/lucide-icons'
import PageIcon from '@/components/PageIcon'

interface Props {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen]         = useState(false)
  const [query, setQuery]       = useState('')
  const ref                     = useRef<HTMLDivElement>(null)
  const searchRef               = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const q = query.toLowerCase().trim()

  const localResults = q
    ? SVG_ICONS.filter((name) => name.toLowerCase().includes(q))
    : SVG_ICONS

  const lucideResults = q
    ? LUCIDE_ICON_NAMES.filter((name) => name.toLowerCase().includes(q) || lucideDisplayName(name).toLowerCase().includes(q))
    : LUCIDE_ICON_NAMES

  // Display label for trigger button
  let label = 'No icon'
  if (value) {
    if (isSvgIcon(value))     label = value.charAt(0).toUpperCase() + value.slice(1)
    else if (isLucideIcon(value)) label = lucideDisplayName(getLucideIconName(value))
    else label = value
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm bg-white hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
      >
        {value ? (
          <PageIcon value={value} className="w-5 h-5 shrink-0" />
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
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-3 w-64">
          {/* Search input */}
          <div className="relative mb-3">
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
              placeholder="Search all icons…"
              className="w-full pl-7 pr-2 py-1.5 text-xs border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3">
            {/* Local SVG section */}
            {localResults.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5">
                  Your Icons
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {localResults.map((name) => (
                    <button
                      key={`local-${name}`}
                      type="button"
                      onClick={() => { onChange(name); setOpen(false) }}
                      title={name}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                        value === name
                          ? 'border-[#5b5ce2] bg-[#ede9fe]'
                          : 'border-transparent hover:border-[#e5e7eb] hover:bg-[#f9fafb]'
                      }`}
                    >
                      <img src={`/icons/${name}.svg`} alt={name} className="w-5 h-5" />
                      <span className="text-[9px] text-[#6b7280] capitalize truncate w-full text-center leading-none">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lucide global icons section */}
            {lucideResults.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5">
                  Global Icons
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {lucideResults.map((name) => {
                    const Icon = LUCIDE_ICON_MAP[name]
                    const stored = `lucide:${name}`
                    return (
                      <button
                        key={`lucide-${name}`}
                        type="button"
                        onClick={() => { onChange(stored); setOpen(false) }}
                        title={lucideDisplayName(name)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                          value === stored
                            ? 'border-[#5b5ce2] bg-[#ede9fe]'
                            : 'border-transparent hover:border-[#e5e7eb] hover:bg-[#f9fafb]'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-[#374151]" />
                        <span className="text-[9px] text-[#6b7280] truncate w-full text-center leading-none">
                          {lucideDisplayName(name)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* No results */}
            {localResults.length === 0 && lucideResults.length === 0 && (
              <p className="text-xs text-[#9ca3af] text-center py-4">
                No icons match &ldquo;{query}&rdquo;
              </p>
            )}
          </div>

          {/* None option */}
          <div className="mt-2 pt-2 border-t border-[#f3f4f6]">
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
        </div>
      )}
    </div>
  )
}
