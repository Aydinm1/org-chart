'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPostLoginPath } from '../../lib/auth/navigation'
import type { UserRole } from '../../lib/db/types'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.message || 'Login failed')
        return
      }

      const nextRole = data.user?.role as UserRole | undefined
      const nextPath = nextRole ? getPostLoginPath(nextRole) : '/edit'

      router.replace(nextPath)
      router.refresh()
    } catch (loginError) {
      console.error('Login error:', loginError)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_18%,transparent),transparent_22%),linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-deep)_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-md items-center justify-center py-8 sm:py-16">
        <section className="w-full rounded-[34px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_92%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_74%,var(--color-cream)))] p-6 shadow-[0_26px_62px_-42px_color-mix(in_srgb,var(--color-gold)_36%,transparent)] sm:p-8">
          <form onSubmit={handleLogin} className="flex h-full flex-col gap-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-ink)]">
                Log in
              </h1>
              <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-soft)]">
                Use your account password or temporary password to continue.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-auto w-full rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Continue'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
