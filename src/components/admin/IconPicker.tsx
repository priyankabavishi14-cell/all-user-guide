'use client'

import { useState, useRef, useEffect } from 'react'

export const SVG_ICONS = ['location', 'sales', 'user'] as const
export type SvgIconName = (typeof SVG_ICONS)[number]

export function isSvgIcon(value: string): value is SvgIconName {
  return (SVG_ICONS as readonly string[]).includes(value)
}

interface Props {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

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
        {value && isSvgIcon(value) ? (
          <img src={`/icons/${value}.svg`} alt={value} className="w-5 h-5 shrink-0" />
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
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-3 w-48">
          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
            Choose Icon
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {SVG_ICONS.map((name) => (
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
                <span className="text-[10px] text-[#6b7280] capitalize">{name}</span>
              </button>
            ))}
          </div>
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
