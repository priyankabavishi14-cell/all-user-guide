'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  totalPages: number;
  welcomeScreenEnabled: boolean;
  slug: string;
}

export default function StatsCards({ totalPages, welcomeScreenEnabled, slug }: Props) {
  const [welcomeOn, setWelcomeOn] = useState(welcomeScreenEnabled);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm">
        <div className="text-3xl mb-3">📄</div>
        <div className="text-4xl font-bold text-[#111827]">{totalPages}</div>
        <p className="text-[#6b7280] text-sm mt-1">Total Pages</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#111827] mb-4">Guide Setup</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#374151] font-medium">Welcome Screen</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Controls default landing experience</p>
          </div>
          <button
            onClick={() => setWelcomeOn((prev) => !prev)}
            aria-label="Toggle welcome screen"
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
              welcomeOn ? 'bg-[#5b5ce2]' : 'bg-[#d1d5db]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                welcomeOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <Link
        href={`/admin/${slug}/pages/new`}
        className="bg-gradient-to-br from-[#5b5ce2] to-[#7c3aed] rounded-xl p-5 shadow-sm text-white hover:opacity-90 transition-opacity"
      >
        <div className="text-3xl mb-3">➕</div>
        <p className="font-semibold text-lg">Create Page</p>
        <p className="text-sm text-purple-200 mt-1">Add content to your guide</p>
      </Link>
    </div>
  );
}
