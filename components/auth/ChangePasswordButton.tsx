'use client'

import { useState } from 'react'

export default function ChangePasswordButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to update password')
        return
      }

      setSuccess(data.message || 'Password updated successfully')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (submitError) {
      console.error('Change password error:', submitError)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm()
          setIsOpen(true)
        }}
        className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-white/80 px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
      >
        Change Password
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[30px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_88%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_66%,var(--color-cream)))] p-6 shadow-[0_24px_54px_-36px_color-mix(in_srgb,var(--color-teal)_24%,transparent)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent)]">
                  Account
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">
                  Change password
                </h2>
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                  Use your current or temporary password to set a new one.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  resetForm()
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white text-xl leading-none text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Current password"
                value={formData.currentPassword}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                required
              />

              <input
                type="password"
                placeholder="New password"
                value={formData.newPassword}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                required
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                required
              />

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                  className="flex-1 rounded-full border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-surface-soft)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
