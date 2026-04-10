'use client'

import { useState } from 'react'
import type { UserRole } from '../../lib/db/types'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: { name: string; email: string; role: UserRole }) => Promise<boolean>
}

export default function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<{ name: string; email: string; role: UserRole | '' }>({
    name: '',
    email: '',
    role: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.role) {
      setErrorMessage('All fields are required')
      return
    }
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const success = await onSubmit({ name: formData.name, email: formData.email, role: formData.role })
      if (success) {
        setFormData({ name: '', email: '', role: '' })
        onClose()
      } else {
        setErrorMessage('Failed to add user. Please try again.')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_24px_60px_-30px_color-mix(in_srgb,var(--color-teal)_30%,transparent)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
              User Management
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">Add New User</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] text-xl leading-none text-[color:var(--color-ink-soft)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-ink)]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          ) : null}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-[color:var(--color-border)] px-4 py-3 outline-none focus:border-[color:var(--color-border-strong)]"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-[color:var(--color-border)] px-4 py-3 outline-none focus:border-[color:var(--color-border-strong)]"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-2xl border border-[color:var(--color-border)] px-4 py-3 outline-none focus:border-[color:var(--color-border-strong)]"
            required
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[color:var(--color-border)] px-4 py-3 text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-surface-soft)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-[color:var(--color-accent)] px-4 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
            >
              {isSubmitting ? 'Adding User...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
