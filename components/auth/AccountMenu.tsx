'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthenticatedUser } from '../../lib/auth/types'
import { withBasePath } from '../../lib/base-path'

interface AccountMenuProps {
  currentUser: AuthenticatedUser
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'

export default function AccountMenu({ currentUser }: AccountMenuProps) {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const currentPasswordId = useId()
  const newPasswordId = useId()
  const confirmPasswordId = useId()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const initials = useMemo(() => getInitials(currentUser.name), [currentUser.name])
  const canOpenEditor = currentUser.role === 'admin' || currentUser.role === 'editor'
  const canOpenAdmin = currentUser.role === 'admin'

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const resetPasswordForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setPasswordError(null)
    setPasswordSuccess(null)
  }

  const openProfile = () => {
    setAccountError(null)
    resetPasswordForm()
    setIsMenuOpen(false)
    setIsProfileOpen(true)
  }

  const handleLogout = async () => {
    setAccountError(null)

    try {
      const response = await fetch(withBasePath('/api/auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setAccountError(data.message || 'Logout failed')
        return
      }

      setIsMenuOpen(false)
      setIsProfileOpen(false)
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setAccountError('An unexpected error occurred while logging out.')
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    setIsSubmittingPassword(true)

    try {
      const response = await fetch(withBasePath('/api/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.message || 'Failed to update password')
        return
      }

      setPasswordSuccess(data.message || 'Password updated successfully')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Change password error:', error)
      setPasswordError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setAccountError(null)

    if (!window.confirm('Deactivate this account? You will be logged out immediately.')) {
      return
    }

    setIsDeletingAccount(true)

    try {
      const response = await fetch(withBasePath('/api/auth/delete-account'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setAccountError(data.message || 'Failed to deactivate account')
        return
      }

      setIsMenuOpen(false)
      setIsProfileOpen(false)
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Delete account error:', error)
      setAccountError('An unexpected error occurred while deactivating the account.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onClick={() => {
            setAccountError(null)
            setIsMenuOpen((current) => !current)
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_18%,transparent),color-mix(in_srgb,var(--color-teal)_88%,var(--color-teal)))] text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_-20px_color-mix(in_srgb,var(--color-teal)_60%,transparent)] transition hover:brightness-105"
        >
          {initials}
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 z-40 mt-3 w-[260px] overflow-hidden rounded-[28px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_94%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_76%,var(--color-cream)))] p-2 shadow-[0_26px_60px_-32px_color-mix(in_srgb,var(--color-teal)_30%,transparent)]">
            <div className="rounded-[22px] border border-[color:var(--color-border)] bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                Signed In
              </p>
              <p className="mt-2 text-base font-bold text-[color:var(--color-ink)]">{currentUser.name}</p>
              <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{currentUser.email}</p>
            </div>

            <div className="mt-2 flex flex-col gap-1">
              <button
                type="button"
                onClick={openProfile}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={openProfile}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
              >
                Change Password
              </button>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
              >
                Main Page
              </Link>
              {canOpenEditor ? (
                <Link
                  href="/edit"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
                >
                  Open Editor
                </Link>
              ) : null}
              {canOpenAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
                >
                  Open Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
              >
                Log Out
              </button>
              {accountError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {accountError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {isProfileOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-[32px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_92%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_72%,var(--color-cream)))] p-6 shadow-[0_26px_62px_-34px_color-mix(in_srgb,var(--color-teal)_30%,transparent)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent)]">
                  Profile
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">
                  {currentUser.name}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                  Review account details, update your password, or deactivate this account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false)
                  resetPasswordForm()
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white text-xl leading-none text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
              >
                ×
              </button>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-[color:var(--color-border)] bg-white/80 px-4 py-4 text-sm text-[color:var(--color-ink)] sm:grid-cols-2">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                  Name
                </p>
                <p className="mt-2 font-semibold">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                  Role
                </p>
                <p className="mt-2 font-semibold capitalize">{currentUser.role}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                  Email
                </p>
                <p className="mt-2 font-semibold">{currentUser.email}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent)]">
                  Change Password
                </p>
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                  Use your current password or temporary password to set a new one.
                </p>
              </div>

              <div>
                <label htmlFor={currentPasswordId} className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Current Password
                </label>
                <input
                  id={currentPasswordId}
                  type="password"
                  value={formData.currentPassword}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                  required
                />
              </div>

              <div>
                <label htmlFor={newPasswordId} className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  New Password
                </label>
                <input
                  id={newPasswordId}
                  type="password"
                  value={formData.newPassword}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                  required
                />
              </div>

              <div>
                <label htmlFor={confirmPasswordId} className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Confirm New Password
                </label>
                <input
                  id={confirmPasswordId}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                  required
                />
              </div>

              {passwordError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {passwordError}
                </div>
              ) : null}

              {passwordSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {passwordSuccess}
                </div>
              ) : null}

              {accountError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {accountError}
                </div>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingPassword ? 'Saving...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingAccount ? 'Deactivating...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
