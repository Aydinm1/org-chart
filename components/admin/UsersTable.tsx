'use client'
import { useEffect, useState } from "react"
import { UserSummary } from "../../lib/auth/types"
import { UserRole } from "../../lib/db/types"
import { withBasePath } from "../../lib/base-path"
import AddUserModal from "./AddUserModal"

export default function UsersTable() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [editedUsers, setEditedUsers] = useState<Record<number, Partial<UserSummary>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)

  const getUsers = async () => {
    try {
      setLoading(true)

      const response = await fetch(withBasePath('/api/admin/users'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to fetch users')
        return
      }

      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('An unexpected error occurred while fetching users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    setError(null)
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await fetch(withBasePath(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to delete user')
        return
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      setEditedUsers((prevEditedUsers) => {
        const nextEditedUsers = { ...prevEditedUsers }
        delete nextEditedUsers[userId]
        return nextEditedUsers
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('An unexpected error occurred while deleting the user. Please try again.')
    }
  }

  const handleSaveAll = async () => {
    setError(null)
    setSaveMessage(null)
    const entries = Object.entries(editedUsers)

    if (entries.length === 0) {
      setSaveMessage('No changes to save')
      return
    }

    for (const [userId, changes] of entries) {
      const response = await fetch(withBasePath(`/api/admin/users/${userId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to update user')
        return
      }
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        editedUsers[user.id] ? { ...user, ...editedUsers[user.id] } : user,
      ),
    )
    setEditedUsers({})
    setSaveMessage('Changes saved successfully')
  }

  const updateDraft = (userId: number, changes: Partial<UserSummary>) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...changes,
      },
    }))
  }

  useEffect(() => {
    getUsers()
  }, [])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    if (!normalizedSearch) return true
    return (
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.role.toLowerCase().includes(normalizedSearch) ||
      String(user.id).includes(normalizedSearch)
    )
  })

  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.isActive).length
  const adminUsers = users.filter((user) => user.role === 'admin').length
  const pendingChanges = Object.keys(editedUsers).length

  return (
    <section className="rounded-[32px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_76%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_48%,var(--color-cream)))] p-5 shadow-[0_24px_54px_-40px_color-mix(in_srgb,var(--color-teal)_30%,transparent)] sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
              User Management
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[color:var(--color-ink)]">
              Access Roster
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--color-ink-soft)]">
              Search, update, and review admin account access in one place. Edits stay local until
              you save them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                Total
              </p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                Active
              </p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{activeUsers}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                Admins
              </p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{adminUsers}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                Drafts
              </p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{pendingChanges}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-xl">
              <label htmlFor="user-search" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]">
                Search Users
              </label>
              <input
                id="user-search"
                type="text"
                placeholder="Search by name, email, role, or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-ink)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-white)_70%,transparent)] outline-none transition focus:border-[color:var(--color-border-strong)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--color-accent)_80%,transparent)] transition hover:brightness-105"
                onClick={handleSaveAll}
              >
                Save Changes
              </button>
              <button
                className="rounded-full border border-[color:var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)] shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--color-ink)_10%,transparent)] transition hover:bg-[color:var(--color-surface-soft)]"
                onClick={() => {
                  setEditedUsers({})
                  setSaveMessage('All changes discarded')
                }}
              >
                Discard Changes
              </button>
                <button type="button" className="rounded-full border border-[color:var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)] shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--color-ink)_10%,transparent)] transition hover:bg-[color:var(--color-surface-soft)]" onClick={() => {setError(null); setSaveMessage(null); setTemporaryPassword(null); setIsAddUserModalOpen(true)}}>
                Add User
              </button>
              <AddUserModal isOpen = {isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onSubmit={async (formData) => {
                try{
                    setError(null)
                    setSaveMessage(null)
                    setTemporaryPassword(null)
                    setPasswordCopied(false)

                    const response = await fetch(withBasePath('/api/admin/users'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    })
                    const data = await response.json()

                    if(!response.ok){
                        setError(data.message || 'Failed to add user')
                        return false
                    }
                    setTemporaryPassword(data.temporaryPassword || null)
                    setSaveMessage('User added successfully')
                    await getUsers()
                    return true
                }
                catch (error) {
                    console.error('Error adding user:', error)
                    setError('An unexpected error occurred while adding the user. Please try again.')
                    return false
                }
              }}
            />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {saveMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {saveMessage}
            </div>
          ) : null}

           {temporaryPassword ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">Copy this temporary password now.</p>
              <p className="mt-1 text-amber-700">
                It will not be shown again after you leave this screen.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="rounded-xl bg-white px-3 py-2 font-bold text-[color:var(--color-ink)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-white)_75%,transparent)]">
                  {temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(temporaryPassword)
                      setPasswordCopied(true)
                    } catch (error) {
                      console.error('Error copying temporary password:', error)
                      setError('Failed to copy temporary password. Please copy it manually.')
                    }
                  }}
                  className="rounded-full border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-surface-soft)]"
                >
                  {passwordCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[color:var(--color-surface-soft)]">
                  <tr className="text-left">
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">ID</th>
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">Name</th>
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">Email</th>
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">Role</th>
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">Active</th>
                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[color:var(--color-ink-soft)]">
                        Loading users...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && !error && filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[color:var(--color-ink-soft)]">
                        No users found.
                      </td>
                    </tr>
                  ) : null}

                  {!loading && !error && filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-[color:var(--color-structure-soft)] align-top">
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--color-ink-soft)]">
                          #{user.id}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={editedUsers[user.id]?.name ?? user.name}
                          onChange={(e) => updateDraft(user.id, { name: e.target.value })}
                          className="w-full min-w-[11rem] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-3 py-2.5 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={editedUsers[user.id]?.email ?? user.email}
                          onChange={(e) => updateDraft(user.id, { email: e.target.value })}
                          className="w-full min-w-[14rem] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-3 py-2.5 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={editedUsers[user.id]?.role ?? user.role}
                          onChange={(e) => updateDraft(user.id, { role: e.target.value as UserRole })}
                          className="w-full min-w-[8rem] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-3 py-2.5 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-2">
                          <input
                            type="checkbox"
                            checked={editedUsers[user.id]?.isActive ?? user.isActive}
                            onChange={(e) => updateDraft(user.id, { isActive: e.target.checked })}
                            className="h-4 w-4 accent-[color:var(--color-accent)]"
                          />
                          <span className="text-sm font-medium text-[color:var(--color-ink-soft)]">
                            {(editedUsers[user.id]?.isActive ?? user.isActive) ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
