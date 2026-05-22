'use client'

import { useActionState } from 'react'
import { viewerLoginAction, type ViewerLoginState } from './actions'

interface Props {
  slug: string
  projectTitle: string
}

export default function ViewerLoginClient({ slug, projectTitle }: Props) {
  const initialState: ViewerLoginState = {}
  const boundAction = viewerLoginAction.bind(null, slug)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[#5b5ce2]">GuideManager</span>
          <h1 className="text-xl font-semibold text-[#111827] mt-3">
            Login to access
          </h1>
          <p className="text-[#5b5ce2] font-medium mt-1">{projectTitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-8">
          {state.message && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
                  state.errors?.email ? 'border-red-400' : 'border-[#e5e7eb]'
                }`}
              />
              {state.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5ce2] transition ${
                  state.errors?.password ? 'border-red-400' : 'border-[#e5e7eb]'
                }`}
              />
              {state.errors?.password && (
                <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isPending ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-6">
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  )
}
