'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, type LoginState } from './actions'

const initialState: LoginState = {}

const inputBase =
  'w-full h-11 px-3 rounded-lg border text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition-all'
const inputNormal = `${inputBase} border-[#e5e7eb] focus:border-[#5b5ce2] focus:ring-2 focus:ring-[#ede9fe]`
const inputError = `${inputBase} border-[#ef4444] focus:ring-2 focus:ring-red-100`

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <header className="px-6 py-4 border-b border-[#e5e7eb] bg-white">
        <span className="font-bold text-[#5b5ce2] text-lg">AdminConsole</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-8">
          <div className="mb-6">
            <h1 className="text-[26px] font-bold text-[#111827] leading-tight">
              Welcome Back
            </h1>
            <p className="text-[#6b7280] text-sm mt-1">
              Login to manage your documentation
            </p>
          </div>

          {state.message && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#111827] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className={state.errors?.email ? inputError : inputNormal}
              />
              {state.errors?.email && (
                <p className="mt-1 text-xs text-[#ef4444]">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#111827]"
                >
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-[#5b5ce2] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className={state.errors?.password ? inputError : inputNormal}
              />
              {state.errors?.password && (
                <p className="mt-1 text-xs text-[#ef4444]">{state.errors.password[0]}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-lg text-white font-semibold text-sm
                  bg-gradient-to-r from-[#5b5ce2] to-[#7c3aed]
                  hover:brightness-110 transition-all
                  disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {pending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/admin/signup"
              className="text-[#5b5ce2] font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
