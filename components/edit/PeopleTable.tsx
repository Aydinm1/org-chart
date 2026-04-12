'use client'

import { useEffect, useMemo, useState } from 'react'
import DirectoryCard from '../directory/DirectoryCard'
import type { EditableMembership } from '../../lib/airtable/types'
import type { DirectoryCardViewModel } from '../../lib/directory/types'

type DraftMemberships = Record<
  string,
  Partial<
    Pick<
      EditableMembership,
      'role' | 'isChair' | 'order' | 'personFullName' | 'personEmail' | 'personPhone'
    >
  >
>

export default function PeopleTable() {
  const [memberships, setMemberships] = useState<EditableMembership[]>([])
  const [editedMemberships, setEditedMemberships] = useState<DraftMemberships>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all')
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null)
  const [uploadingMembershipId, setUploadingMembershipId] = useState<string | null>(null)

  const getMemberships = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/directory/memberships', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to fetch memberships')
        return
      }

      setMemberships(data.memberships)
    } catch (fetchError) {
      console.error('Error fetching memberships:', fetchError)
      setError('An unexpected error occurred while fetching memberships. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateDraft = (
    membershipId: string,
    changes: DraftMemberships[string],
  ) => {
    setEditedMemberships((prev) => ({
      ...prev,
      [membershipId]: {
        ...prev[membershipId],
        ...changes,
      },
    }))
  }

  const handleSaveAll = async () => {
    setError(null)
    setSaveMessage(null)

    const entries = Object.entries(editedMemberships)
    if (entries.length === 0) {
      setSaveMessage('No changes to save')
      return
    }

    for (const [membershipId, changes] of entries) {
      const response = await fetch(`/api/directory/memberships/${membershipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to update membership')
        return
      }
    }

    setMemberships((prevMemberships) =>
      prevMemberships.map((membership) =>
        editedMemberships[membership.id]
          ? { ...membership, ...editedMemberships[membership.id] }
          : membership,
      ),
    )
    setEditedMemberships({})
    setSaveMessage('Changes saved')
  }

  const handlePhotoUpload = async (
    membershipId: string,
    personId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setError(null)
    setSaveMessage(null)

    try {
      setUploadingMembershipId(membershipId)

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`/api/directory/people/${personId}/photo`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to upload photo')
        return
      }

      setMemberships((prevMemberships) =>
        prevMemberships.map((membership) =>
          membership.personId === personId
            ? { ...membership, personPhoto: data.person.photo }
            : membership,
        ),
      )
      setSaveMessage('Photo uploaded')
    } catch (uploadError) {
      console.error('Error uploading photo:', uploadError)
      setError('An unexpected error occurred while uploading the photo. Please try again.')
    } finally {
      setUploadingMembershipId(null)
      event.target.value = ''
    }
  }

  useEffect(() => {
    getMemberships()
  }, [])

  const availableGroups = useMemo(() => {
    const groups = memberships
      .filter((membership) => membership.groupId && membership.groupName)
      .map((membership) => ({
        id: membership.groupId as string,
        name: membership.groupName,
      }))

    return [...new Map(groups.map((group) => [group.id, group])).values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    )
  }, [memberships])

  const filteredMemberships = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return memberships.filter((membership) => {
      if (selectedGroupId !== 'all' && membership.groupId !== selectedGroupId) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return (
        membership.personFullName.toLowerCase().includes(normalizedSearch) ||
        membership.role.toLowerCase().includes(normalizedSearch) ||
        membership.personEmail.toLowerCase().includes(normalizedSearch) ||
        membership.membershipName.toLowerCase().includes(normalizedSearch) ||
        membership.groupName.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [memberships, searchTerm, selectedGroupId])

  useEffect(() => {
    if (filteredMemberships.length === 0) {
      if (selectedMembershipId !== null) {
        setSelectedMembershipId(null)
      }
      return
    }

    if (
      !selectedMembershipId ||
      !filteredMemberships.some((membership) => membership.id === selectedMembershipId)
    ) {
      setSelectedMembershipId(filteredMemberships[0].id)
    }
  }, [filteredMemberships, selectedMembershipId])

  const selectedIndex = selectedMembershipId
    ? filteredMemberships.findIndex((membership) => membership.id === selectedMembershipId)
    : -1
  const selectedBaseMembership = selectedIndex >= 0 ? filteredMemberships[selectedIndex] : null
  const selectedMembership =
    selectedBaseMembership && selectedMembershipId
      ? { ...selectedBaseMembership, ...editedMemberships[selectedMembershipId] }
      : null
  const selectedDraft = selectedMembershipId ? editedMemberships[selectedMembershipId] : undefined

  const previewCard: DirectoryCardViewModel | null = selectedMembership
    ? {
        id: `preview:${selectedMembership.id}`,
        type: 'person',
        title: selectedMembership.personFullName || selectedMembership.membershipName || 'Unnamed Person',
        subtitle: selectedMembership.role || undefined,
        image: selectedMembership.personPhoto,
        email: selectedMembership.personEmail || undefined,
        phone: selectedMembership.personPhone || undefined,
        sectionName: 'Preview',
        order: selectedMembership.order ?? 0,
      }
    : null

  const totalMemberships = memberships.length
  const chairMemberships = memberships.filter((membership) => membership.isChair).length
  const pendingChanges = Object.keys(editedMemberships).length

  const moveSelection = (direction: -1 | 1) => {
    if (selectedIndex < 0) {
      return
    }

    const nextIndex = (selectedIndex + direction + filteredMemberships.length) % filteredMemberships.length
    setSelectedMembershipId(filteredMemberships[nextIndex].id)
  }

  return (
    <section className="rounded-[34px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_84%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_54%,var(--color-cream)))] p-5 shadow-[0_28px_60px_-42px_color-mix(in_srgb,var(--color-teal)_28%,transparent)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            Memberships
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--color-ink)]">
            Card editor
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{totalMemberships}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">
              Chairs
            </p>
            <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{chairMemberships}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">
              Drafts
            </p>
            <p className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">{pendingChanges}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
          <select
            value={selectedGroupId}
            onChange={(event) => setSelectedGroupId(event.target.value)}
            className="min-w-[220px] rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
          >
            <option value="all">All groups</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search memberships"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-border-strong)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
            onClick={handleSaveAll}
          >
            Save
          </button>
          <button
            type="button"
            className="rounded-full border border-[color:var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-surface-soft)]"
            onClick={() => {
              setEditedMemberships({})
              setSaveMessage('Drafts cleared')
            }}
          >
            Discard
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {saveMessage ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveMessage}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_380px] xl:items-start">
        <aside className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-soft)]">
              Cards
            </h3>
            <span className="text-xs text-[color:var(--color-ink-soft)]">{filteredMemberships.length}</span>
          </div>

          <div className="flex max-h-[720px] flex-col gap-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-5 text-sm text-[color:var(--color-ink-soft)]">
                Loading...
              </div>
            ) : null}

            {!loading && filteredMemberships.length === 0 ? (
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-5 text-sm text-[color:var(--color-ink-soft)]">
                No memberships found.
              </div>
            ) : null}

            {!loading &&
              filteredMemberships.map((membership) => {
                const isSelected = membership.id === selectedMembershipId
                const isDirty = Boolean(editedMemberships[membership.id])

                return (
                  <button
                    key={membership.id}
                    type="button"
                    onClick={() => setSelectedMembershipId(membership.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? 'border-[color:var(--color-border-strong)] bg-white shadow-[0_16px_30px_-24px_color-mix(in_srgb,var(--color-teal)_30%,transparent)]'
                        : 'border-[color:var(--color-border)] bg-white/75 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-ink)]">
                          {membership.personFullName || membership.membershipName || 'Unnamed Person'}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">
                          {membership.groupName || 'Ungrouped'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {membership.isChair ? (
                          <span className="rounded-full bg-[color:var(--color-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            Chair
                          </span>
                        ) : null}
                        {isDirty ? (
                          <span className="rounded-full bg-[color:var(--color-surface-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">
                            Draft
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>
        </aside>

        <section className="rounded-[30px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_80%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_56%,var(--color-cream)))] p-6 shadow-[0_22px_48px_-36px_color-mix(in_srgb,var(--color-teal)_24%,transparent)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => moveSelection(-1)}
              disabled={selectedIndex < 0 || filteredMemberships.length <= 1}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white text-xl text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                Live Preview
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[color:var(--color-ink)]">
                {selectedMembership
                  ? selectedMembership.personFullName || selectedMembership.membershipName || 'Unnamed Person'
                  : 'No selection'}
              </h3>
              {selectedMembership?.groupName ? (
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                  {selectedMembership.groupName}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => moveSelection(1)}
              disabled={selectedIndex < 0 || filteredMemberships.length <= 1}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white text-xl text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>

          <div className="flex min-h-[430px] items-center justify-center rounded-[26px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] p-6">
            {selectedMembership && previewCard ? (
              <DirectoryCard card={previewCard} />
            ) : (
              <div className="text-sm text-[color:var(--color-ink-soft)]">Select a card</div>
            )}
          </div>
        </section>

        <aside className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent)]">
              Quick Edit
            </p>
            <h3 className="mt-2 text-xl font-bold text-[color:var(--color-ink)]">
              {selectedMembership ? 'Selected card' : 'No selection'}
            </h3>
          </div>

          {selectedMembership && selectedMembershipId ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedDraft?.personFullName ?? selectedMembership.personFullName}
                  onChange={(event) =>
                    updateDraft(selectedMembershipId, { personFullName: event.target.value })
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedDraft?.personEmail ?? selectedMembership.personEmail}
                  onChange={(event) =>
                    updateDraft(selectedMembershipId, { personEmail: event.target.value })
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Phone
                </label>
                <input
                  type="text"
                  value={selectedDraft?.personPhone ?? selectedMembership.personPhone}
                  onChange={(event) =>
                    updateDraft(selectedMembershipId, { personPhone: event.target.value })
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                    Role
                  </label>
                  <input
                    type="text"
                    value={selectedDraft?.role ?? selectedMembership.role}
                    onChange={(event) => updateDraft(selectedMembershipId, { role: event.target.value })}
                    className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                  />
                </div>

                <label className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[color:var(--color-ink)]">
                  <input
                    type="checkbox"
                    checked={selectedDraft?.isChair ?? selectedMembership.isChair}
                    onChange={(event) =>
                      updateDraft(selectedMembershipId, { isChair: event.target.checked })
                    }
                  />
                  Chair
                </label>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                  Order
                </label>
                <input
                  type="number"
                  value={(selectedDraft?.order ?? selectedMembership.order ?? '').toString()}
                  onChange={(event) =>
                    updateDraft(selectedMembershipId, {
                      order: event.target.value === '' ? null : Number(event.target.value),
                    })
                  }
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--color-border-strong)]"
                />
              </div>

              <div className="flex items-center gap-3">
                <label
                  className={`inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm font-semibold ${
                    uploadingMembershipId === selectedMembershipId
                      ? 'bg-[color:var(--color-surface-soft)] text-[color:var(--color-ink-soft)]'
                      : 'bg-[color:var(--color-accent)] text-white'
                  }`}
                >
                  {uploadingMembershipId === selectedMembershipId ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingMembershipId === selectedMembershipId || !selectedMembership.personId}
                    onChange={(event) =>
                      selectedMembership.personId
                        ? handlePhotoUpload(selectedMembershipId, selectedMembership.personId, event)
                        : undefined
                    }
                  />
                </label>

                <span className="text-xs text-[color:var(--color-ink-soft)]">
                  {selectedMembership.personPhoto ? 'Photo set' : 'No photo'}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white px-4 py-6 text-sm text-[color:var(--color-ink-soft)]">
              Pick a card from the left.
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
