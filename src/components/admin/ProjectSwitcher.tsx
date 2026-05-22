'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types'

interface Props {
  currentProject: Project
  allProjects: Project[]
}

export default function ProjectSwitcher({ currentProject, allProjects }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-2 hover:border-[#5b5ce2] transition-colors"
      >
        <span className="text-sm text-[#111827] font-medium truncate">
          {currentProject.title}
        </span>
        <span className="text-[#6b7280] ml-1 text-xs shrink-0">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-md z-10 overflow-hidden">
          {allProjects.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-[#9ca3af]">No projects</p>
          ) : (
            allProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setOpen(false)
                  router.push(`/admin/${p.slug}`)
                }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                  p.id === currentProject.id
                    ? 'bg-[#ede9fe] text-[#5b5ce2] font-medium'
                    : 'text-[#111827] hover:bg-[#f9fafb]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    p.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="truncate">{p.title}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
